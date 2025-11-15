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

export const GeminiExecutor: NodeExecutor<GeminiData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(
    geminiExecutionChannel().status({
      nodeId,
      status: "loading",
    })
  );

  if (!data.variableName) {
    await publish(
      geminiExecutionChannel().status({
        nodeId,
        status: "error",
      })
    );

    throw new NonRetriableError("Error: variable name is missing");
  }

  if (!data.userPrompt) {
    await publish(
      geminiExecutionChannel().status({
        nodeId,
        status: "error",
      })
    );

    throw new NonRetriableError("Error: variable name is missing");
  }

  if (!data.credentialId) {
    await publish(
      geminiExecutionChannel().status({
        nodeId,
        status: "error",
      })
    );

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
      },
    });
  });

  if (!credential) {
    throw new NonRetriableError("Credential not found");
  }

  const google = createGoogleGenerativeAI({
    apiKey: credential.id,
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

    await publish(
      geminiExecutionChannel().status({
        nodeId,
        status: "success",
      })
    );

    return {
      ...context,
      [data.variableName]: {
        text: text,
      },
    };
  } catch {
    await publish(
      geminiExecutionChannel().status({
        nodeId,
        status: "error",
      })
    );

    throw new Error();
  }
};
