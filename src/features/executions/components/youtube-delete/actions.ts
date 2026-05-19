"use server";

import { getSubscriptionToken } from "inngest/realtime";
import { youtubeDeleteChannel } from "@/inngest/channels/youtube-delete";
import { inngest } from "@/inngest/client";

export async function fetchYoutubeDeleteToken() {
  const token = await getSubscriptionToken(inngest, {
    channel: youtubeDeleteChannel,
    topics: ["status"],
  });
  if (!token.key) {
    throw new Error("Failed to obtain realtime subscription token key");
  }
  return { key: token.key, apiBaseUrl: token.apiBaseUrl };
}
