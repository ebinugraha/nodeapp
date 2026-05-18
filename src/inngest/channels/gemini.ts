import { channel } from "inngest/realtime";
import { z } from "zod";

const statusSchema = z.object({
  nodeId: z.string(),
  status: z.enum(["loading", "success", "error"]),
});

export const geminiExecutionChannel = channel({
  name: "gemini-execution",
  topics: {
    status: { schema: statusSchema },
  },
});
