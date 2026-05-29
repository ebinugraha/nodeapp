import { NodeExecutor } from "@/features/executions/type";
import Handlebars from "handlebars";
import { geminiExecutionChannel } from "@/inngest/channels/gemini";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { NonRetriableError } from "inngest";
import prisma from "@/lib/db";

Handlebars.registerHelper("json", (context) => {
  const stringified = JSON.stringify(context, null, 2);
  return new Handlebars.SafeString(stringified);
});

type GeminiData = {
  variableName?: string;
  model?: string;
  systemPrompt?: string;
  credentialId?: string;
  userPrompt?: string;
};

// Helper function to publish error with detailed error info
const publishError = async (
  step: any,
  nodeId: string,
  topicSuffix: string,
  error: { message: string; code?: string; field?: string }
) => {
  await step.realtime.publish(
    `gemini-${nodeId}-${topicSuffix}`,
    geminiExecutionChannel.status,
    { nodeId, status: "error", error },
  );
};

export const GeminiExecutor: NodeExecutor<GeminiData> = async ({
  data,
  nodeId,
  context,
  userId,
  step,
}) => {
  await step.realtime.publish(
    `gemini-${nodeId}-loading`,
    geminiExecutionChannel.status,
    { nodeId, status: "loading" },
  );

  if (!data.variableName) {
    await publishError(step, nodeId, "error-var", {
      message: "Variable name is required to store the output",
      code: "missing",
      field: "Variable Name",
    });

    throw new NonRetriableError("Error: variable name is missing");
  }

  if (!data.userPrompt) {
    await publishError(step, nodeId, "error-prompt", {
      message: "User prompt is required for the AI to generate text",
      code: "missing",
      field: "User Prompt",
    });

    throw new NonRetriableError("Error: user prompt is missing");
  }

  if (!data.credentialId) {
    await publishError(step, nodeId, "error-cred", {
      message: "Please configure your Google AI API credential",
      code: "missing",
      field: "Credential",
    });

    throw new NonRetriableError("Error: Credential id required");
  }

  const systemPrompt = data.systemPrompt
    ? Handlebars.compile(data.systemPrompt)(context)
    : "You are a helpful assistant";
  const userPrompt = Handlebars.compile(data.userPrompt)(context);

  const credential = await step.run("get-credential", () => {
    return prisma.credential.findUnique({
      where: {
        id: data.credentialId,
        userId,
      },
    });
  });

  if (!credential) {
    await publishError(step, nodeId, "error-cred-not-found", {
      message: "The configured credential was not found or has been deleted",
      code: "not_found",
      field: "Credential",
    });

    throw new NonRetriableError("Credential not found");
  }

  const google = createGoogleGenerativeAI({
    apiKey: credential.value,
  });

  try {
    const { steps } = await step.ai.wrap("gemini-generate-text", generateText, {
      model: google(data.model || "gemini-2.0-flash"),
      system: systemPrompt,
      prompt: userPrompt,
      experimental_telemetry: {
        isEnabled: true,
        recordInputs: true,
        recordOutputs: true,
      },
    });

    const text =
      steps[0].content[0].type === "text" ? steps[0].content[0].text : "";

    await step.realtime.publish(
      `gemini-${nodeId}-success`,
      geminiExecutionChannel.status,
      { nodeId, status: "success" },
    );

    return {
      ...context,
      [data.variableName]: {
        text: text,
      },
    };
  } catch (err: any) {
    await publishError(step, nodeId, "error-generate", {
      message: err?.message || "Failed to generate text from Gemini",
      code: "api_error",
    });

    throw new Error(err?.message || "Gemini generation failed");
  }
};