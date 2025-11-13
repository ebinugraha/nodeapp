import { channel, topic } from "@inngest/realtime";

export const geminiExecutionChannel = channel("gemini-execution").addTopic(
  topic("status").type<{
    nodeId: string;
    status: "loading" | "success" | "error";
  }>()
);
