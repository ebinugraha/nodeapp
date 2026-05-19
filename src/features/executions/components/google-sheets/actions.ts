"use server";

import { getSubscriptionToken } from "inngest/realtime";
import { googleSheetsChannel } from "@/inngest/channels/google-sheets";
import { inngest } from "@/inngest/client";

export async function fetchGoogleSheetsToken() {
  const token = await getSubscriptionToken(inngest, {
    channel: googleSheetsChannel,
    topics: ["status"],
  });
  if (!token.key) {
    throw new Error("Failed to obtain realtime subscription token key");
  }
  return { key: token.key, apiBaseUrl: token.apiBaseUrl };
}
