"use server";

import { googleSheetsChannel } from "@/inngest/channels/google-sheets";
import { inngest } from "@/inngest/client";
import { getSubscriptionToken, type Realtime } from "inngest/realtime";

export type GoogleSheetsToken = Realtime.Subscribe.Token<
  typeof googleSheetsChannel,
  ["status"]
>;

export async function fetchGoogleSheetsToken(): Promise<GoogleSheetsToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: googleSheetsChannel,
    topics: ["status"],
  });

  return token;
}
