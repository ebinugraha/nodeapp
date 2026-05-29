"use server";

import prisma from "@/lib/db";
import { CredentialType } from "@prisma/client";
import { getOrRefreshAccessToken } from "@/lib/google-token-manager";

// YouTube Data API quota costs
// https://developers.google.com/youtube/v3/determine_quota_cost
const YOUTUBE_API_COSTS = {
  // Videos
  "videos.list": 1,
  "videos.insert": 1600,
  "videos.update": 50,
  "videos.delete": 50,

  // Search
  "search.list": 100,
  "search.insert": 100,

  // Live Chat
  "liveBroadcasts.list": 1,
  "liveChatMessages.list": 1,
  "liveChatMessages.insert": 50,

  // Comments
  "comments.list": 1,
  "comments.insert": 50,
  "comments.update": 50,
  "comments.delete": 50,
  "comments.markAsSpam": 50,

  // Channels
  "channels.list": 1,

  // Subscriptions
  "subscriptions.list": 1,

  // Default cost if endpoint not listed
  default: 1,
} as const;

export type YoutubeApiEndpoint = keyof typeof YOUTUBE_API_COSTS;

export interface QuotaUsage {
  daily: {
    used: number;
    limit: number;
    percentage: number;
    remaining: number;
    isNearLimit: boolean;
    isOverLimit: boolean;
  };
  monthly: {
    used: number;
    limit: number;
    percentage: number;
    remaining: number;
    isNearLimit: boolean;
    isOverLimit: boolean;
  };
  resetInfo: {
    dailyResetsAt: Date;
    monthlyResetsAt: Date;
  };
}

// Check if we need to reset quota (daily resets at midnight UTC, monthly resets on 1st)
function shouldResetDaily(lastReset: Date | null): boolean {
  if (!lastReset) return true;

  const now = new Date();
  const lastResetDate = new Date(lastReset);

  // Reset if it's a new day in UTC
  return now.toISOString().split("T")[0] !== lastResetDate.toISOString().split("T")[0];
}

function shouldResetMonthly(lastReset: Date | null): boolean {
  if (!lastReset) return true;

  const now = new Date();
  const lastResetDate = new Date(lastReset);

  // Reset if it's a new month in UTC
  const nowMonth = now.toISOString().slice(0, 7); // YYYY-MM
  const lastMonth = lastResetDate.toISOString().slice(0, 7);
  return nowMonth !== lastMonth;
}

function getNextDailyReset(): Date {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);
  return tomorrow;
}

function getNextMonthlyReset(): Date {
  const now = new Date();
  const nextMonth = new Date(now);
  nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1);
  nextMonth.setUTCDate(1);
  nextMonth.setUTCHours(0, 0, 0, 0);
  return nextMonth;
}

// Track YouTube API quota usage
export async function trackYoutubeQuota(
  credentialId: string,
  endpoint: YoutubeApiEndpoint,
  userId: string
): Promise<QuotaUsage | null> {
  // Get the credential
  const credential = await prisma.credential.findFirst({
    where: {
      id: credentialId,
      userId,
      type: CredentialType.YOUTUBE,
    },
  }) as any;

  if (!credential) {
    return null;
  }

  const cost = YOUTUBE_API_COSTS[endpoint] ?? YOUTUBE_API_COSTS.default;
  const now = new Date();

  // Check if we need to reset daily quota
  const shouldResetDailyQuota = shouldResetDaily(credential.lastQuotaReset ?? null);
  const shouldResetMonthlyQuota = shouldResetMonthly(credential.lastMonthlyReset ?? null);

  // Build update object
  const updateData: any = {};

  if (shouldResetDailyQuota) {
    updateData.dailyQuotaUsed = cost;
    updateData.lastQuotaReset = now;
  } else {
    updateData.dailyQuotaUsed = { increment: cost };
  }

  if (shouldResetMonthlyQuota) {
    updateData.monthlyQuotaUsed = cost;
    updateData.lastMonthlyReset = now;
  } else {
    updateData.monthlyQuotaUsed = { increment: cost };
  }

  // Update the credential
  const updated = await prisma.credential.update({
    where: { id: credentialId },
    data: updateData,
  });

  return getQuotaUsage(updated);
}

// Get current quota usage for a credential
export async function getYoutubeQuotaUsage(
  credentialId: string,
  userId: string
): Promise<QuotaUsage | null> {
  const credential = await prisma.credential.findFirst({
    where: {
      id: credentialId,
      userId,
      type: CredentialType.YOUTUBE,
    },
  }) as any;

  if (!credential) {
    return null;
  }

  return getQuotaUsage(credential);
}

// Format quota usage from database record
function getQuotaUsage(credential: any): QuotaUsage {
  // Handle case where columns don't exist yet (return default values)
  const dailyUsed = credential.dailyQuotaUsed ?? 0;
  const dailyLimit = credential.dailyQuotaLimit ?? 10000;
  const monthlyUsed = credential.monthlyQuotaUsed ?? 0;
  const monthlyLimit = credential.monthlyQuotaLimit ?? 1000000;

  // Check if we need to reset daily quota (shouldn't happen here but just in case)
  if (shouldResetDaily(credential.lastQuotaReset)) {
    const now = new Date();
    return {
      daily: {
        used: 0,
        limit: dailyLimit,
        percentage: 0,
        remaining: dailyLimit,
        isNearLimit: false,
        isOverLimit: false,
      },
      monthly: {
        used: monthlyUsed,
        limit: monthlyLimit,
        percentage: Math.round((monthlyUsed / monthlyLimit) * 100),
        remaining: monthlyLimit - monthlyUsed,
        isNearLimit: monthlyUsed > monthlyLimit * 0.8,
        isOverLimit: monthlyUsed > monthlyLimit,
      },
      resetInfo: {
        dailyResetsAt: getNextDailyReset(),
        monthlyResetsAt: getNextMonthlyReset(),
      },
    };
  }

  return {
    daily: {
      used: dailyUsed,
      limit: dailyLimit,
      percentage: Math.round((dailyUsed / dailyLimit) * 100),
      remaining: dailyLimit - dailyUsed,
      isNearLimit: dailyUsed > dailyLimit * 0.8,
      isOverLimit: dailyUsed > dailyLimit,
    },
    monthly: {
      used: monthlyUsed,
      limit: monthlyLimit,
      percentage: Math.round((monthlyUsed / monthlyLimit) * 100),
      remaining: monthlyLimit - monthlyUsed,
      isNearLimit: monthlyUsed > monthlyLimit * 0.8,
      isOverLimit: monthlyUsed > monthlyLimit,
    },
    resetInfo: {
      dailyResetsAt: getNextDailyReset(),
      monthlyResetsAt: getNextMonthlyReset(),
    },
  };
}

// Reset quota manually (admin function)
export async function resetYoutubeQuota(
  credentialId: string,
  userId: string,
  type: "daily" | "monthly" | "both" = "both"
): Promise<boolean> {
  const updateData: any = {};

  if (type === "daily" || type === "both") {
    updateData.dailyQuotaUsed = 0;
    updateData.lastQuotaReset = new Date();
  }

  if (type === "monthly" || type === "both") {
    updateData.monthlyQuotaUsed = 0;
    updateData.lastMonthlyReset = new Date();
  }

  try {
    await prisma.credential.update({
      where: { id: credentialId },
      data: updateData,
    });
    return true;
  } catch {
    return false;
  }
}

// Get all YouTube credentials quota for a user
export async function getAllYoutubeQuotaUsage(
  userId: string
): Promise<Array<{ credentialId: string; name: string; usage: QuotaUsage }>> {
  const credentials = await prisma.credential.findMany({
    where: {
      userId,
      type: CredentialType.YOUTUBE,
    },
  }) as any[];

  return credentials.map((cred) => ({
    credentialId: cred.id,
    name: cred.name,
    usage: getQuotaUsage(cred),
  }));
}

// Update quota limits for a credential
export async function updateQuotaLimits(
  credentialId: string,
  dailyLimit: number,
  monthlyLimit: number
): Promise<void> {
  await prisma.credential.update({
    where: { id: credentialId },
    data: {
      dailyQuotaLimit: dailyLimit,
      monthlyQuotaLimit: monthlyLimit,
    },
  });
}

// Test YouTube API connection
export async function testYoutubeConnection(credentialId: string): Promise<{
  success: boolean;
  message: string;
  quotaCost?: number;
}> {
  try {
    // Get access token
    const accessToken = await getOrRefreshAccessToken(credentialId);

    // Try a simple API call to test connection
    // Using channels.list which costs only 1 quota unit
    const response = await fetch(
      "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true&maxResults=1",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        message: error.error?.message || `API Error: ${response.status}`,
      };
    }

    const data = await response.json();

    // Track the quota cost for this test
    await trackYoutubeQuota(credentialId, "channels.list", "");

    if (data.items && data.items.length > 0) {
      return {
        success: true,
        message: `Connected as "${data.items[0].snippet.title}"`,
        quotaCost: 1,
      };
    }

    return {
      success: true,
      message: "Connection successful, but no channel data found",
      quotaCost: 1,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to connect to YouTube API",
    };
  }
}
