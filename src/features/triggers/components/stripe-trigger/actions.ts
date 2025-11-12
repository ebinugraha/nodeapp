"use server";

import { stripeTriggerChannel } from "@/inngest/channels/stripe-trigger";
import { inngest } from "@/inngest/client";
import { getSubscriptionToken, Realtime } from "@inngest/realtime";

export type StripeTriggerToken = Realtime.Token<
  typeof stripeTriggerChannel,
  ["status"]
>;

export async function fetcStripeTriggerToken(): Promise<StripeTriggerToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: stripeTriggerChannel(),
    topics: ["status"],
  });

  return token;
}
