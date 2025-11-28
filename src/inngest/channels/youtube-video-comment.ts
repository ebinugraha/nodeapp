import { channel, topic } from "@inngest/realtime";

export const youtubeVideoCommentChannel = channel(
  "youtube-video-comment-execution"
).addTopic(
  topic("status").type<{
    nodeId: string;
    status: "loading" | "success" | "error";
  }>()
);
