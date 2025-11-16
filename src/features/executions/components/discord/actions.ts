"use server";

import { discordExecutionChannel } from "@/inngest/channels/discord";
import { inngest } from "@/inngest/client";
import { getSubscriptionToken, Realtime } from "@inngest/realtime";

export type DiscordToken = Realtime.Token<
  typeof discordExecutionChannel,
  ["status"]
>;

export async function fetchDiscordToken(): Promise<DiscordToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: discordExecutionChannel(),
    topics: ["status"],
  });

  return token;
}
