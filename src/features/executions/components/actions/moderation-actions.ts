"use server";

import { getSubscriptionToken } from "inngest/realtime";
import {
  aiModerationChannel,
  discordNotifyChannel,
  filterChannel,
  sentimentAnalysisChannel,
  spamDetectionChannel,
  storeDBChannel,
  waitDelayChannel,
  webhookChannel,
  youtubePinChannel,
  youtubeReplyChannel,
  youtubeTimeoutChannel,
  gamblingCheckerChannel,
} from "@/inngest/channels/moderation";
import { inngest } from "@/inngest/client";

export async function fetchYoutubeReplyToken() {
  const token = await getSubscriptionToken(inngest, {
    channel: youtubeReplyChannel,
    topics: ["status"],
  });
  if (!token.key) throw new Error("Failed to get realtime token");
  return { key: token.key, apiBaseUrl: token.apiBaseUrl };
}

export async function fetchYoutubeTimeoutToken() {
  const token = await getSubscriptionToken(inngest, {
    channel: youtubeTimeoutChannel,
    topics: ["status"],
  });
  if (!token.key) throw new Error("Failed to get realtime token");
  return { key: token.key, apiBaseUrl: token.apiBaseUrl };
}

export async function fetchDiscordNotifyToken() {
  const token = await getSubscriptionToken(inngest, {
    channel: discordNotifyChannel,
    topics: ["status"],
  });
  if (!token.key) throw new Error("Failed to get realtime token");
  return { key: token.key, apiBaseUrl: token.apiBaseUrl };
}

export async function fetchAIModerationToken() {
  const token = await getSubscriptionToken(inngest, {
    channel: aiModerationChannel,
    topics: ["status"],
  });
  if (!token.key) throw new Error("Failed to get realtime token");
  return { key: token.key, apiBaseUrl: token.apiBaseUrl };
}

export async function fetchSentimentToken() {
  const token = await getSubscriptionToken(inngest, {
    channel: sentimentAnalysisChannel,
    topics: ["status"],
  });
  if (!token.key) throw new Error("Failed to get realtime token");
  return { key: token.key, apiBaseUrl: token.apiBaseUrl };
}

export async function fetchSpamToken() {
  const token = await getSubscriptionToken(inngest, {
    channel: spamDetectionChannel,
    topics: ["status"],
  });
  if (!token.key) throw new Error("Failed to get realtime token");
  return { key: token.key, apiBaseUrl: token.apiBaseUrl };
}

export async function fetchFilterToken() {
  const token = await getSubscriptionToken(inngest, {
    channel: filterChannel,
    topics: ["status"],
  });
  if (!token.key) throw new Error("Failed to get realtime token");
  return { key: token.key, apiBaseUrl: token.apiBaseUrl };
}

export async function fetchWaitDelayToken() {
  const token = await getSubscriptionToken(inngest, {
    channel: waitDelayChannel,
    topics: ["status"],
  });
  if (!token.key) throw new Error("Failed to get realtime token");
  return { key: token.key, apiBaseUrl: token.apiBaseUrl };
}

export async function fetchWebhookToken() {
  const token = await getSubscriptionToken(inngest, {
    channel: webhookChannel,
    topics: ["status"],
  });
  if (!token.key) throw new Error("Failed to get realtime token");
  return { key: token.key, apiBaseUrl: token.apiBaseUrl };
}

export async function fetchStoreDBToken() {
  const token = await getSubscriptionToken(inngest, {
    channel: storeDBChannel,
    topics: ["status"],
  });
  if (!token.key) throw new Error("Failed to get realtime token");
  return { key: token.key, apiBaseUrl: token.apiBaseUrl };
}

export async function fetchYoutubePinToken() {
  const token = await getSubscriptionToken(inngest, {
    channel: youtubePinChannel,
    topics: ["status"],
  });
  if (!token.key) throw new Error("Failed to get realtime token");
  return { key: token.key, apiBaseUrl: token.apiBaseUrl };
}

export async function fetchGamblingToken() {
  const token = await getSubscriptionToken(inngest, {
    channel: gamblingCheckerChannel,
    topics: ["status"],
  });
  if (!token.key) throw new Error("Failed to get realtime token");
  return { key: token.key, apiBaseUrl: token.apiBaseUrl };
}

