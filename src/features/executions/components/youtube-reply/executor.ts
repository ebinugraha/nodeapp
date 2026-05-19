import { NodeExecutor } from "@/features/executions/type";
import { NonRetriableError } from "inngest";
import { getOrRefreshAccessToken } from "@/lib/google-token-manager";
import { compileTemplate } from "@/features/executions/lib/template";

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
  raw?: Record<string, unknown>;
};

export const YouTubeReplyExecutor: NodeExecutor<YouTubeReplyData> = async ({
  data,
  context,
  step,
}) => {
  return step.run("youtube-reply-comment", async () => {
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

    // Compile template with context variables
    const replyText = compileTemplate(data.replyTemplate, context) || "Thank you for your comment!";

    // Apply delay if configured
    if (data.delaySeconds && data.delaySeconds > 0) {
      await new Promise((resolve) => setTimeout(resolve, (data.delaySeconds || 0) * 1000));
    }

    const response = await fetch(
      "https://www.googleapis.com/youtube/v3/comments",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          snippet: {
            parentId: commentData.commentId,
            textOriginal: replyText,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new NonRetriableError(
        `Failed to reply to comment: ${error.error?.message || response.statusText}`
      );
    }

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