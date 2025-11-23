import { channel, topic } from "@inngest/realtime";

export const youtubeLiveChatChannel = channel(
  "youtube-live-chat-execution"
).addTopic(
  topic("status").type<{
    nodeId: string;
    status: "loading" | "success" | "error";
  }>()
);
