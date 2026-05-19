import { Inngest } from "inngest";

export type AppEvents = Record<string, unknown>;

// In dev (NODE_ENV !== "production") route realtime publish/subscribe through
// the local inngest-cli dev server (http://127.0.0.1:8288). In prod, route
// through Inngest Cloud. Without this flag the SDK defaults to "cloud" mode
// even under `next dev`, so step.realtime.publish() and getSubscriptionToken()
// both target production and the local dev server never sees the traffic.
export const inngest = new Inngest({
  id: "nodeapp",
  isDev: process.env.NODE_ENV !== "production",
});
