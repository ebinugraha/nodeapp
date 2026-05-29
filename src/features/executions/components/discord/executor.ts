import { NodeExecutor } from "@/features/executions/type";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import { discordExecutionChannel } from "@/inngest/channels/discord";
import { decode } from "html-entities";
import ky from "ky";

Handlebars.registerHelper("json", (context: any) => {
  const stringified = JSON.stringify(context, null, 2);
  return new Handlebars.SafeString(stringified);
});

type DiscordData = {
  variableName?: string;
  webhookUrl?: string;
  content?: string;
  username?: string;
};

// Helper function to publish error with detailed error info
const publishError = async (
  step: any,
  nodeId: string,
  topicSuffix: string,
  error: { message: string; code?: string; field?: string }
) => {
  await step.realtime.publish(
    `discord-${nodeId}-${topicSuffix}`,
    discordExecutionChannel.status,
    { nodeId, status: "error", error },
  );
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
    await publishError(step, nodeId, "error-var", {
      message: "Variable name is required to store the response",
      code: "missing",
      field: "Variable Name",
    });
    throw new NonRetriableError("Error: variable name is missing");
  }

  if (!data.content) {
    await publishError(step, nodeId, "error-content", {
      message: "Message content is required to send to Discord",
      code: "missing",
      field: "Content",
    });
    throw new NonRetriableError("Error: content is missing");
  }

  if (!data.webhookUrl) {
    await publishError(step, nodeId, "error-webhook", {
      message: "Discord webhook URL is required to send messages",
      code: "missing",
      field: "Webhook URL",
    });
    throw new NonRetriableError("Error: webhook URL is missing");
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
          content: content.slice(0, 2000),
          username,
        },
      });

      return {
        ...context,
        [data.variableName!]: {
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
  } catch (err: any) {
    const errorMessage =
      err?.response?.statusText ||
      err?.message ||
      "Failed to send message to Discord";

    await step.realtime.publish(
      `discord-${nodeId}-error-send`,
      discordExecutionChannel.status,
      {
        nodeId,
        status: "error",
        error: {
          message: errorMessage,
          code:
            err?.response?.status === 404
              ? "not_found"
              : err?.response?.status === 403
                ? "permission"
                : err?.response?.status === 429
                  ? "rate_limit"
                  : "api_error",
        },
      },
    );

    throw new Error(errorMessage);
  }
};