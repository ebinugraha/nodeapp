import { channel } from "inngest/realtime";
import { z } from "zod";

const errorSchema = z.object({
  message: z.string(),
  code: z.string().optional(),
  field: z.string().optional(),
});

const statusSchema = z.object({
  nodeId: z.string(),
  status: z.enum(["loading", "success", "error"]),
  error: errorSchema.optional(),
});

export const discordExecutionChannel = channel({
  name: "discord-execution",
  topics: {
    status: { schema: statusSchema },
  },
});
