"use server";

import { getSubscriptionToken } from "inngest/realtime";
import { manualTriggerChannel } from "@/inngest/channels/manual-trigger";
import { inngest } from "@/inngest/client";

export async function fetchManualTriggerToken() {
  const token = await getSubscriptionToken(inngest, {
    channel: manualTriggerChannel,
    topics: ["status"],
  });
  if (!token.key) {
    throw new Error("Failed to obtain realtime subscription token key");
  }
  return { key: token.key, apiBaseUrl: token.apiBaseUrl };
}
