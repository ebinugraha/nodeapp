import { channel, topic } from "@inngest/realtime";

export const discordExecutionChannel = channel("discord-execution").addTopic(
  topic("status").type<{
    nodeId: string;
    status: "loading" | "success" | "error";
  }>()
);
