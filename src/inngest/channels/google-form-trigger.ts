import { channel, topic } from "@inngest/realtime";

export const googleFormTriggerChannel = channel(
  "google-form-trigger-execution"
).addTopic(
  topic("status").type<{
    nodeId: string;
    status: "loading" | "success" | "error";
  }>()
);
