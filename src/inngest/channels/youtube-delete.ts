import { channel, topic } from "@inngest/realtime";

export const youtubeDeleteChannel = channel(
  "youtube-delete-execution"
).addTopic(
  topic("status").type<{
    nodeId: string;
    status: "loading" | "success" | "error";
  }>()
);
