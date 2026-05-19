"use server";

import { getSubscriptionToken } from "inngest/realtime";
import { discordExecutionChannel } from "@/inngest/channels/discord";
import { inngest } from "@/inngest/client";

// Server actions can only return plain-serializable data to client components.
// The full `getSubscriptionToken` result embeds the channel object (with Zod
// schemas — class instances), which React refuses to serialize. We return only
// `{ key, apiBaseUrl }` here and pass `channel`/`topics` to `useRealtime` on
// the client side.
export async function fetchDiscordToken() {
  const token = await getSubscriptionToken(inngest, {
    channel: discordExecutionChannel,
    topics: ["status"],
  });
  if (!token.key) {
    throw new Error("Failed to obtain realtime subscription token key");
  }
  return { key: token.key, apiBaseUrl: token.apiBaseUrl };
}
