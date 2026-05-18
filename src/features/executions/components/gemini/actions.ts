"use server";

import { geminiExecutionChannel } from "@/inngest/channels/gemini";
import { inngest } from "@/inngest/client";
import { getSubscriptionToken, type Realtime } from "inngest/realtime";

export type HttpRequestToken = Realtime.Subscribe.Token<
  typeof geminiExecutionChannel,
  ["status"]
>;

export async function fetchGeminiToken(): Promise<HttpRequestToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: geminiExecutionChannel,
    topics: ["status"],
  });

  return token;
}
