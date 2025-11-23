import { Inngest } from "inngest";
import { realtimeMiddleware } from "@inngest/realtime/middleware";
// Definisi tipe event untuk type-safety
type Events = {
  "workflows/execute.workflow": {
    data: {
      workflowId: string;
      initialData?: any;
    };
  };
  // Tambahkan event baru ini
  "trigger/youtube.poll": {
    data: {
      nodeId: string;
      videoId: string;
      pollingInterval: number;
    };
  };
};
// Create a client to send and receive events
export const inngest = new Inngest({
  id: "nodeapp",
  middleware: [realtimeMiddleware()],
});
