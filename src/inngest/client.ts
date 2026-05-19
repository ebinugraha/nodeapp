import { Inngest } from "inngest";

export type AppEvents = Record<string, unknown>;

// Realtime (publish/subscribe) is built into inngest v4 — no extra middleware
// needed. Use `step.realtime.publish(id, channel.topic, data)` inside a
// function for durable publishing, or `inngest.realtime.publish(channel.topic, data)`
// for non-durable publishing outside of functions.
export const inngest = new Inngest({
  id: "nodeapp",
});
