import { NonRetriableError } from "inngest";
import { trackYoutubeQuota } from "@/features/credentials/lib/quota-tracking";
import { compileTemplate } from "@/features/executions/lib/template";
import type { NodeExecutor } from "@/features/executions/type";
import { getOrRefreshAccessToken } from "@/lib/google-token-manager";

type YouTubeReplyData = {
  credentialId?: string;
  variableName?: string;
  replyTemplate?: string;
  delaySeconds?: number;
};

type YouTubeCommentData = {
  author?: string;
  text?: string;
  message?: string;
  commentId?: string;
  videoId?: string;
  messageId?: string;
  liveChatId?: string;
  raw?: Record<string, unknown>;
};

export const YouTubeReplyExecutor: NodeExecutor<YouTubeReplyData> = async ({
  data,
  context,
  step,
  userId,
}) => {
  return step.run("youtube-reply-comment", async () => {
    if (!data.credentialId) {
      throw new NonRetriableError("Credential ID is required");
    }
    const accessToken = await getOrRefreshAccessToken(data.credentialId);

    if (!accessToken) {
      throw new NonRetriableError("No access token available");
    }

    const commentData = (context.YOUTUBE_VIDEO_COMMENT ||
      context.YOUTUBE_LIVE_CHAT) as YouTubeCommentData | undefined;

    if (!commentData) {
      throw new NonRetriableError("No YouTube comment data in context");
    }

    // Compile template with context variables
    const replyText =
      compileTemplate(data.replyTemplate, context) ||
      "Thank you for your comment!";

    // Apply delay if configured
    if (data.delaySeconds && data.delaySeconds > 0) {
      await new Promise((resolve) =>
        setTimeout(resolve, (data.delaySeconds || 0) * 1000),
      );
    }

    const isLiveChat = !!commentData.liveChatId;
    let endpoint =
      "https://www.googleapis.com/youtube/v3/comments?part=snippet";
    let body = {};
    let quotaAction: any = "comments.insert";

    if (isLiveChat) {
      endpoint =
        "https://www.googleapis.com/youtube/v3/liveChat/messages?part=snippet";
      body = {
        snippet: {
          type: "textMessageEvent",
          liveChatId: commentData.liveChatId,
          textMessageDetails: {
            messageText: replyText,
          },
        },
      };
      quotaAction = "liveChatMessages.insert";
    } else {
      if (!commentData.commentId) {
        throw new NonRetriableError(
          "No commentId found in context to reply to",
        );
      }

      body = {
        snippet: {
          parentId: commentData.commentId,
          textOriginal: replyText,
        },
      };
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new NonRetriableError(
        `Failed to reply: ${error.error?.message || response.statusText}`,
      );
    }

    // Track quota for insertion
    await trackYoutubeQuota(data.credentialId!, quotaAction, userId);

    const result = await response.json();

    return {
      ...context,
      [data.variableName || "replyResult"]: {
        success: true,
        replyId: result.id,
        parentCommentId: commentData.commentId,
        replyText,
        timestamp: new Date().toISOString(),
      },
    };
  });
};
