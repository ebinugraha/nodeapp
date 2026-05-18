import { Inngest } from "inngest";

export type AppEvents = Record<string, unknown>;

// Create a client to send and receive events
export const inngest = new Inngest({
  id: "nodeapp",
});
