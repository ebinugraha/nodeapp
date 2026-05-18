import { channel } from "inngest/realtime";
import { z } from "zod";

const statusSchema = z.object({
  nodeId: z.string(),
  status: z.enum(["loading", "success", "error"]),
});

export const youtubeDeleteChannel = channel({
  name: "youtube-delete-execution",
  topics: {
    status: { schema: statusSchema },
  },
});
