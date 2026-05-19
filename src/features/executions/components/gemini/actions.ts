"use server";

import { getSubscriptionToken } from "inngest/realtime";
import { geminiExecutionChannel } from "@/inngest/channels/gemini";
import { inngest } from "@/inngest/client";

export async function fetchGeminiToken() {
  const token = await getSubscriptionToken(inngest, {
    channel: geminiExecutionChannel,
    topics: ["status"],
  });
  if (!token.key) {
    throw new Error("Failed to obtain realtime subscription token key");
  }
  return { key: token.key, apiBaseUrl: token.apiBaseUrl };
}
