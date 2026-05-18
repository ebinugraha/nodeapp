import type { Realtime } from "@inngest/realtime";
import { realtimeMiddleware } from "@inngest/realtime/middleware";
import { Inngest, type Middleware } from "inngest";

export const inngest = new Inngest({
  id: "nodeapp",
});
