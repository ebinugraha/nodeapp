"use server";

import { getSubscriptionToken } from "inngest/realtime";
import { httpRequestChannel } from "@/inngest/channels/http-request";
import { inngest } from "@/inngest/client";

export async function fetchHttpRequestToken() {
  const token = await getSubscriptionToken(inngest, {
    channel: httpRequestChannel,
    topics: ["status"],
  });
  if (!token.key) {
    throw new Error("Failed to obtain realtime subscription token key");
  }
  return { key: token.key, apiBaseUrl: token.apiBaseUrl };
}
