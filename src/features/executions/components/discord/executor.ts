import { NodeExecutor } from "@/features/executions/type";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
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
  step,
}) => {
  await step.realtime.publish(
    `discord-${nodeId}-loading`,
    discordExecutionChannel.status,
    { nodeId, status: "loading" },
  );

  if (!data.variableName) {
    await step.realtime.publish(
      `discord-${nodeId}-error-var`,
      discordExecutionChannel.status,
      { nodeId, status: "error" },
    );
    throw new NonRetriableError("Error: variable name is missing");
  }

  if (!data.content) {
    await step.realtime.publish(
      `discord-${nodeId}-error-content`,
      discordExecutionChannel.status,
      { nodeId, status: "error" },
    );
    throw new NonRetriableError("Error: content is missing");
  }

  if (!data.webhookUrl) {
    await step.realtime.publish(
      `discord-${nodeId}-error-webhook`,
      discordExecutionChannel.status,
      { nodeId, status: "error" },
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
        throw new NonRetriableError("Error: variable name is missing");
      }
      return {
        ...context,
        [data.variableName]: {
          messageContent: content.slice(0, 2000),
        },
      };
    });

    await step.realtime.publish(
      `discord-${nodeId}-success`,
      discordExecutionChannel.status,
      { nodeId, status: "success" },
    );

    return result;
  } catch {
    await step.realtime.publish(
      `discord-${nodeId}-error-catch`,
      discordExecutionChannel.status,
      { nodeId, status: "error" },
    );

    throw new Error();
  }
};
