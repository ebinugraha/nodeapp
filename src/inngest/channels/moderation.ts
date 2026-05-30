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

export const youtubeReplyChannel = channel({
  name: "youtube-reply-execution",
  topics: { status: { schema: statusSchema } },
});

export const youtubeHideChannel = channel({
  name: "youtube-hide-execution",
  topics: { status: { schema: statusSchema } },
});


export const youtubeTimeoutChannel = channel({
  name: "youtube-timeout-execution",
  topics: { status: { schema: statusSchema } },
});


export const discordNotifyChannel = channel({
  name: "discord-notify-execution",
  topics: { status: { schema: statusSchema } },
});

export const aiModerationChannel = channel({
  name: "ai-moderation-execution",
  topics: { status: { schema: statusSchema } },
});

export const sentimentAnalysisChannel = channel({
  name: "sentiment-analysis-execution",
  topics: { status: { schema: statusSchema } },
});

export const spamDetectionChannel = channel({
  name: "spam-detection-execution",
  topics: { status: { schema: statusSchema } },
});

export const filterChannel = channel({
  name: "filter-execution",
  topics: { status: { schema: statusSchema } },
});

export const waitDelayChannel = channel({
  name: "wait-delay-execution",
  topics: { status: { schema: statusSchema } },
});

export const webhookChannel = channel({
  name: "webhook-execution",
  topics: { status: { schema: statusSchema } },
});

export const storeDBChannel = channel({
  name: "store-db-execution",
  topics: { status: { schema: statusSchema } },
});

export const youtubePinChannel = channel({
  name: "youtube-pin-execution",
  topics: { status: { schema: statusSchema } },
});
