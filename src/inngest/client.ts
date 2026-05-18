import { Inngest } from "inngest";

export type AppEvents = Record<string, unknown>;

// Create a client to send and receive events. Realtime (publish/subscribe) is
// built into inngest v4 — no extra middleware needed. Use
// `inngest.realtime.publish(channel.topic, data)` from anywhere in your code.
export const inngest = new Inngest({
  id: "nodeapp",
});
