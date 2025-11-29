import { Inngest } from "inngest";
import { realtimeMiddleware } from "@inngest/realtime/middleware";
// Definisi tipe event untuk type-safety

// Create a client to send and receive events
export const inngest = new Inngest({
  id: "nodeapp",
  middleware: [realtimeMiddleware()],
});
