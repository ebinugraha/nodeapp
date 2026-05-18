import { NodeExecutor } from "@/features/executions/type";
import Handlebars from "handlebars";
import { inngest } from "@/inngest/client";
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

export const GeminiExecutor: NodeExecutor<GeminiData> = async ({
  data,
  nodeId,
  context,
  userId,
  step,
}) => {
  await inngest.realtime.publish(geminiExecutionChannel.status, {
    nodeId,
    status: "loading",
  });

  if (!data.variableName) {
    await inngest.realtime.publish(geminiExecutionChannel.status, {
      nodeId,
      status: "error",
    });

    throw new NonRetriableError("Error: variable name is missing");
  }

  if (!data.userPrompt) {
    await inngest.realtime.publish(geminiExecutionChannel.status, {
      nodeId,
      status: "error",
    });

    throw new NonRetriableError("Error: variable name is missing");
  }

  if (!data.credentialId) {
    await inngest.realtime.publish(geminiExecutionChannel.status, {
      nodeId,
      status: "error",
    });

    throw new NonRetriableError("Error: Credential id required");
  }

  // TODO when credentials is missingt

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

    await inngest.realtime.publish(geminiExecutionChannel.status, {
      nodeId,
      status: "success",
    });

    return {
      ...context,
      [data.variableName]: {
        text: text,
      },
    };
  } catch {
    await inngest.realtime.publish(geminiExecutionChannel.status, {
      nodeId,
      status: "error",
    });

    throw new Error();
  }
};
