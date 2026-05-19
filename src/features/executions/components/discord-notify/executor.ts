import { NodeExecutor } from "@/features/executions/type";
import { NonRetriableError } from "inngest";

type DiscordNotifyData = {
  webhookUrl?: string;
  variableName?: string;
  title?: string;
  description?: string;
  color?: string;
  fields?: { name: string; value: string; inline?: boolean }[];
};

type YouTubeCommentData = {
  author?: string;
  text?: string;
  message?: string;
  videoId?: string;
};

export const DiscordNotifyExecutor: NodeExecutor<DiscordNotifyData> = async ({
  data,
  context,
  step,
}) => {
  return step.run("discord-notify", async () => {
    const webhookUrl = data.webhookUrl;

    if (!webhookUrl) {
      throw new NonRetriableError("Discord webhook URL is required");
    }

    const commentData = (context.YOUTUBE_VIDEO_COMMENT || context.YOUTUBE_LIVE_CHAT) as YouTubeCommentData | undefined;

    // Compile template variables
    const compileTemplate = (template: string | undefined) => {
      if (!template) return "";
      return template
        .replace(/\{\{author\}\}/g, commentData?.author || "Unknown")
        .replace(/\{\{comment\}\}/g, commentData?.text || commentData?.message || "")
        .replace(/\{\{videoId\}\}/g, commentData?.videoId || "");
    };

    const title = compileTemplate(data.title) || "YouTube Comment Alert";
    const description = compileTemplate(data.description) || "New comment detected";
    const color = parseInt(data.color?.replace("#", "") || "15158332", 16); // Default red

    const fields = (data.fields || []).map((field) => ({
      name: compileTemplate(field.name),
      value: compileTemplate(field.value),
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
    if (commentData) {
      embed.thumbnail = {
        url: "https://www.gstatic.com/youtube/img/branding/youtubelogo/svg/yt_social_square_rgb.png",
      };
    }

    // Add AI moderation results if available
    const moderationResult = context.moderationResult as Record<string, unknown> | undefined;
    if (moderationResult) {
      embed.fields = [
        ...fields,
        {
          name: "AI Analysis",
          value: `Toxicity: ${moderationResult.toxicity || "N/A"}\nSpam: ${moderationResult.spam || "N/A"}\nSentiment: ${moderationResult.sentiment || "N/A"}`,
          inline: true,
        },
      ];
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
};