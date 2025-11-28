import { channel, topic } from "@inngest/realtime";

export const googleSheetsChannel = channel("google-sheets-execution").addTopic(
  topic("status").type<{
    nodeId: string;
    status: "loading" | "success" | "error";
  }>()
);
