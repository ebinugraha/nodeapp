"use server";

import { getSubscriptionToken } from "inngest/realtime";
import { inngest } from "@/inngest/client";
import { decisionChannel } from "@/inngest/channels/logic";

export async function fetchDecisionToken() {
  try {
    const token = await getSubscriptionToken(inngest, {
      channel: decisionChannel,
      topics: ["status"],
    });
    if (!token.key) throw new Error("Failed to get realtime token");
    return { key: token.key, apiBaseUrl: token.apiBaseUrl };
  } catch (error) {
    console.error("Failed to create decision channel token:", error);
    throw error;
  }
}
