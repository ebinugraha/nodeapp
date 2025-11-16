import { NodeExecutor } from "@/features/executions/type";
import Handlebars from "handlebars";
import { geminiExecutionChannel } from "@/inngest/channels/gemini";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { NonRetriableError } from "inngest";
import prisma from "@/lib/db";
import { discordExecutionChannel } from "@/inngest/channels/discord";
import { decode } from "html-entities";
import ky from "ky";

Handlebars.registerHelper("json", (context) => {
  const stringified = JSON.stringify(context, null, 2);
  return new Handlebars.SafeString(stringified);
});

type DiscordData = {
  variableName?: string;
  webhookUrl?: string;
  content?: string;
  username?: string;
};

export const DiscordExecutor: NodeExecutor<DiscordData> = async ({
  data,
  nodeId,
  context,
  userId,
  step,
  publish,
}) => {
  await publish(
    discordExecutionChannel().status({
      nodeId,
      status: "loading",
    })
  );

  if (!data.variableName) {
    await publish(
      discordExecutionChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("Error: variable name is missing");
  }

  if (!data.content) {
    await publish(
      discordExecutionChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("Error: content is missing");
  }

  if (!data.webhookUrl) {
    await publish(
      discordExecutionChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw new NonRetriableError("Error: webhook is missing");
  }

  const rawContent = Handlebars.compile(data.content)(context);
  const content = decode(rawContent);
  const username = data.username
    ? decode(Handlebars.compile(data.username)(context))
    : undefined;

  try {
    const result = await step.run("discord-webhook", async () => {
      await ky.post(data.webhookUrl!, {
        json: {
          content: content.slice(0, 2000), // discord max lentgh,
          username,
        },
      });

      if (!data.variableName) {
        await publish(
          discordExecutionChannel().status({
            nodeId,
            status: "error",
          })
        );
        throw new NonRetriableError("Error: variable name is missing");
      }
      return {
        ...context,
        [data.variableName]: {
          messageContent: content.slice(0, 2000),
        },
      };
    });

    await publish(
      discordExecutionChannel().status({
        nodeId,
        status: "success",
      })
    );

    return result;
  } catch {
    await publish(
      discordExecutionChannel().status({
        nodeId,
        status: "error",
      })
    );

    throw new Error();
  }
};
