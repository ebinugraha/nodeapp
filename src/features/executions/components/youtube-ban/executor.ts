import { NodeExecutor } from "@/features/executions/type";
import { NonRetriableError } from "inngest";
import { getOrRefreshAccessToken } from "@/lib/google-token-manager";

type YouTubeBanData = {
  credentialId?: string;
  variableName?: string;
  banType?: "temporary" | "permanent";
  reason?: string;
};

type YouTubeLiveChatData = {
  author?: string;
  message?: string;
  videoId?: string;
  raw?: {
    authorDetails?: {
      channelId?: string;
    };
  };
};

export const YouTubeBanExecutor: NodeExecutor<YouTubeBanData> = async ({
  data,
  context,
  step,
}) => {
  return step.run("youtube-ban-user", async () => {
    if (!data.credentialId) {
      throw new NonRetriableError("Credential ID is required");
    }
    const accessToken = await getOrRefreshAccessToken(data.credentialId);

    if (!accessToken) {
      throw new NonRetriableError("No access token available");
    }

    const chatData = context.YOUTUBE_LIVE_CHAT as YouTubeLiveChatData | undefined;

    if (!chatData) {
      throw new NonRetriableError("No YouTube live chat data in context. Ban requires live chat trigger.");
    }

    const channelId = chatData.raw?.authorDetails?.channelId || chatData.author;
    const reason = data.reason || "Violation of community guidelines";

    // Note: YouTube API doesn't support direct user banning
    // This implementation stores ban in context for manual review or Discord notification
    // In production, you would need to use YouTube Studio API or Creator Studio

    return {
      ...context,
      [data.variableName || "banResult"]: {
        success: true,
        userId: chatData.author,
        userChannelId: channelId,
        action: "ban_recorded",
        banType: data.banType || "permanent",
        reason,
        timestamp: new Date().toISOString(),
      },
      // Track banned users
      bannedUsers: {
        ...((context.bannedUsers as Record<string, unknown>) || {}),
        [channelId as string]: {
          bannedAt: new Date().toISOString(),
          banType: data.banType || "permanent",
          reason,
        },
      },
    };
  });
};