import { NonRetriableError } from "inngest";
import { compileTemplate } from "@/features/executions/lib/template";
import type { NodeExecutor } from "@/features/executions/type";
import { discordNotifyChannel } from "@/inngest/channels/moderation";

type DiscordNotifyData = {
  webhookUrl?: string;
  variableName?: string;
  title?: string;
  description?: string;
  color?: string;
  fields?: { name: string; value: string; inline?: boolean }[];
};

export const DiscordNotifyExecutor: NodeExecutor<DiscordNotifyData> = async ({
  data,
  nodeId,
  context,
  step,
}) => {
  // Publish loading status
  await step.realtime.publish(
    `discord-notify-${nodeId}-loading`,
    discordNotifyChannel.status,
    { nodeId, status: "loading" },
  );

  try {
    const result = await step.run("discord-notify", async () => {
      const webhookUrl = data.webhookUrl;

      if (!webhookUrl) {
        throw new NonRetriableError("Discord webhook URL is required");
      }

      const title =
        compileTemplate(data.title, context) || "YouTube Comment Alert";
      const description =
        compileTemplate(data.description, context) || "New comment detected";
      const color = parseInt(data.color?.replace("#", "") || "15158332", 16); // Default red

      const fields = (data.fields || []).map((field) => ({
        name: compileTemplate(field.name, context),
        value: compileTemplate(field.value, context),
        inline: field.inline ?? false,
      }));

      // Build Discord embed
      const embed: Record<string, unknown> = {
        title,
        description,
        color,
        fields,
        footer: {
          text: "CleenChat Moderation System",
        },
        timestamp: new Date().toISOString(),
      };

      // Add thumbnail for YouTube comments
      const commentData = context.YOUTUBE_LIVE_CHAT;
      if (commentData) {
        embed.thumbnail = {
          url: "https://www.gstatic.com/youtube/img/branding/youtubelogo/svg/yt_social_square_rgb.png",
        };
      }



      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          embeds: [embed],
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new NonRetriableError(`Discord webhook failed: ${error}`);
      }

      return {
        ...context,
        [data.variableName || "discordNotifyResult"]: {
          success: true,
          messageId: response.headers.get("x-message-id"),
          timestamp: new Date().toISOString(),
        },
      };
    });

    // Publish success status
    await step.realtime.publish(
      `discord-notify-${nodeId}-success`,
      discordNotifyChannel.status,
      { nodeId, status: "success" },
    );

    return result;
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error
        ? err.message
        : "Failed to send Discord notification";

    // Publish error status
    await step.realtime.publish(
      `discord-notify-${nodeId}-error`,
      discordNotifyChannel.status,
      { nodeId, status: "error", error: { message: errorMessage } },
    );

    throw err;
  }
};
