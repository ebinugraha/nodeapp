"use server";

import { manualTriggerChannel } from "@/inngest/channels/manual-trigger";
import { inngest } from "@/inngest/client";
import { getSubscriptionToken, type Realtime } from "inngest/realtime";

export type ManualTriggerToken = Realtime.Subscribe.Token<
  typeof manualTriggerChannel,
  ["status"]
>;

export async function fetchManualTriggerToken(): Promise<ManualTriggerToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: manualTriggerChannel,
    topics: ["status"],
  });

  return token;
}
