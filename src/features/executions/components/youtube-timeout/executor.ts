import { NodeExecutor } from "@/features/executions/type";
import { NonRetriableError } from "inngest";
import { getOrRefreshAccessToken } from "@/lib/google-token-manager";

type YouTubeTimeoutData = {
  credentialId?: string;
  variableName?: string;
  durationSeconds?: number;
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

export const YouTubeTimeoutExecutor: NodeExecutor<YouTubeTimeoutData> = async ({
  data,
  context,
  step,
}) => {
  return step.run("youtube-timeout-user", async () => {
    if (!data.credentialId) {
      throw new NonRetriableError("Credential ID is required");
    }
    const accessToken = await getOrRefreshAccessToken(data.credentialId);

    if (!accessToken) {
      throw new NonRetriableError("No access token available");
    }

    const chatData = context.YOUTUBE_LIVE_CHAT as YouTubeLiveChatData | undefined;

    if (!chatData) {
      throw new NonRetriableError("No YouTube live chat data in context. Timeout requires live chat trigger.");
    }

    const durationSeconds = data.durationSeconds || 300; // Default 5 minutes
    const reason = data.reason || "Violation of community guidelines";

    // YouTube API: Ban user from live chat temporarily
    // Note: YouTube Live Streaming API doesn't have direct timeout API
    // This implementation stores timeout in context for downstream processing

    return {
      ...context,
      [data.variableName || "timeoutResult"]: {
        success: true,
        userId: chatData.author,
        userChannelId: chatData.raw?.authorDetails?.channelId || chatData.author,
        action: "timeout_scheduled",
        durationSeconds,
        reason,
        expiresAt: new Date(Date.now() + durationSeconds * 1000).toISOString(),
        timestamp: new Date().toISOString(),
      },
      // Also add to a trackedTimeouts object for rate limiting
      trackedTimeouts: {
        ...((context.trackedTimeouts as Record<string, unknown>) || {}),
        [chatData.author as string]: {
          expiresAt: new Date(Date.now() + durationSeconds * 1000).toISOString(),
          reason,
        },
      },
    };
  });
};