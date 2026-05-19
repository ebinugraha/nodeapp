import { NodeExecutor } from "@/features/executions/type";
import { NonRetriableError } from "inngest";

type YouTubePinData = {
  credentialId?: string;
  variableName?: string;
  isPinned?: boolean;
};

type YouTubeCommentData = {
  author?: string;
  text?: string;
  message?: string;
  commentId?: string;
};

export const YouTubePinExecutor: NodeExecutor<YouTubePinData> = async ({
  data,
  context,
  step,
}) => {
  return step.run("youtube-pin-comment", async () => {
    const commentData = (context.YOUTUBE_VIDEO_COMMENT || context.YOUTUBE_LIVE_CHAT) as YouTubeCommentData | undefined;

    if (!commentData) {
      throw new NonRetriableError("No YouTube comment data in context");
    }

    // Note: YouTube API doesn't support pinning comments via API
    // This is a placeholder for future API support or alternative approach
    // For now, we'll log the action

    return {
      ...context,
      [data.variableName || "pinResult"]: {
        success: true,
        commentId: commentData.commentId,
        action: "pin_requested",
        note: "YouTube API does not support pinning comments directly. Consider highlighting in Discord.",
        timestamp: new Date().toISOString(),
      },
    };
  });
};