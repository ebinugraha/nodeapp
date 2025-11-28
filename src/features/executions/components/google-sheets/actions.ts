"use server";

import { googleSheetsChannel } from "@/inngest/channels/google-sheets";
import { inngest } from "@/inngest/client";
import { getSubscriptionToken, Realtime } from "@inngest/realtime";

export type GoogleSheetsToken = Realtime.Token<
  typeof googleSheetsChannel,
  ["status"]
>;

export async function fetchGoogleSheetsToken(): Promise<GoogleSheetsToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: googleSheetsChannel(),
    topics: ["status"],
  });

  return token;
}
