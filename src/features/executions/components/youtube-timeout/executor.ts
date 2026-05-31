import { NonRetriableError } from "inngest";
import type { NodeExecutor } from "@/features/executions/type";
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
  liveChatId?: string;
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

    const chatData = context.YOUTUBE_LIVE_CHAT as
      | YouTubeLiveChatData
      | undefined;

    if (!chatData) {
      throw new NonRetriableError(
        "No YouTube live chat data in context. Timeout requires live chat trigger.",
      );
    }

    const durationSeconds = data.durationSeconds || 300; // Default 5 minutes

    const channelId = chatData.raw?.authorDetails?.channelId;
    if (!channelId) {
      throw new NonRetriableError(
        "Cannot timeout user: author channelId is missing from live chat data",
      );
    }

    if (!chatData.liveChatId) {
      throw new NonRetriableError(
        "Cannot timeout user: liveChatId is missing from live chat data",
      );
    }

    // Call YouTube API to ban/timeout user
    const response = await fetch(
      "https://www.googleapis.com/youtube/v3/liveChat/bans?part=snippet",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          snippet: {
            liveChatId: chatData.liveChatId,
            type: "temporary",
            banDurationSeconds: durationSeconds,
            bannedUserDetails: {
              channelId: channelId,
            },
          },
        }),
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new NonRetriableError(
        `Failed to timeout user: ${error.error?.message || response.statusText}`,
      );
    }

    const result = await response.json();

    return {
      ...context,
      [data.variableName || "timeoutResult"]: {
        success: true,
        userId: chatData.author,
        userChannelId: channelId,
        action: "timeout",
        durationSeconds,
        banId: result.id,
        expiresAt: new Date(Date.now() + durationSeconds * 1000).toISOString(),
        timestamp: new Date().toISOString(),
      },
    };
  });
};
