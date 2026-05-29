import { NodeExecutor } from "@/features/executions/type";
import { NonRetriableError } from "inngest";
import { getOrRefreshAccessToken } from "@/lib/google-token-manager";
import { trackYoutubeQuota } from "@/features/credentials/lib/quota-tracking";

type YouTubeHideData = {
  credentialId?: string;
  variableName?: string;
  reason?: "spam" | "inappropriate" | "dangerous" | "harassment";
};

type YouTubeCommentData = {
  author?: string;
  text?: string;
  message?: string;
  commentId?: string;
  channelId?: string;
};

export const YouTubeHideExecutor: NodeExecutor<YouTubeHideData> = async ({
  data,
  context,
  step,
  userId,
}) => {
  return step.run("youtube-hide-comment", async () => {
    if (!data.credentialId) {
      throw new NonRetriableError("Credential ID is required");
    }
    const accessToken = await getOrRefreshAccessToken(data.credentialId);

    if (!accessToken) {
      throw new NonRetriableError("No access token available");
    }

    const commentData = (context.YOUTUBE_VIDEO_COMMENT || context.YOUTUBE_LIVE_CHAT) as YouTubeCommentData | undefined;

    if (!commentData) {
      throw new NonRetriableError("No YouTube comment data in context");
    }

    // Use YouTube API to mark comment as spam/held for review
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/comments/markAsSpam`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          authorChannelId: commentData.channelId || commentData.author,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new NonRetriableError(
        `Failed to hide comment: ${error.error?.message || response.statusText}`
      );
    }

    // Track quota for markAsSpam operation
    await trackYoutubeQuota(data.credentialId!, "comments.markAsSpam", userId);

    return {
      ...context,
      [data.variableName || "hideResult"]: {
        success: true,
        commentId: commentData.commentId,
        action: "marked_as_spam",
        timestamp: new Date().toISOString(),
      },
    };
  });
};