import type { Realtime } from "@inngest/realtime";
import { realtimeMiddleware } from "@inngest/realtime/middleware";
import { Inngest, type Middleware } from "inngest";

export type AppEvents = Record<string, unknown>;

// `@inngest/realtime@0.4` is built against `inngest@3`, so its generated
// `InngestMiddleware` type doesn't structurally match v4's `Middleware.Class`
// shape — even though the runtime middleware itself still works correctly.
// We cast through a v4-shaped middleware class whose `transformFunctionInput`
// declares the `publish` context extension so that Inngest function handlers
// see `publish` as `Realtime.PublishFn` instead of erroring at type level.
type RealtimePublishMiddleware = (new (args: { client: Inngest.Any }) => {
  readonly id: string;
  transformFunctionInput(arg: Middleware.TransformFunctionInputArgs): {
    ctx: { publish: Realtime.PublishFn };
  };
}) &
  Middleware.Class;

const realtime = realtimeMiddleware() as unknown as RealtimePublishMiddleware;

// Create a client to send and receive events
export const inngest = new Inngest({
  id: "nodeapp",
  middleware: [realtime],
});
