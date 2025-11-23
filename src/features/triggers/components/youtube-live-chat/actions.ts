"use server";

import { youtubeLiveChatChannel } from "@/inngest/channels/youtube-live-chat";
import { inngest } from "@/inngest/client";
import prisma from "@/lib/db";
import { getSubscriptionToken, Realtime } from "@inngest/realtime";

export type YoutubeTriggerToken = Realtime.Token<
  typeof youtubeLiveChatChannel,
  ["status"]
>;

export async function fetchYoutubeToken(): Promise<YoutubeTriggerToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: youtubeLiveChatChannel(),
    topics: ["status"],
  });

  return token;
}

// Action baru untuk tombol Continue/Pause
export async function toggleYoutubePolling(
  nodeId: string,
  isActive: boolean,
  videoId?: string,
  pollingInterval: number = 10
) {
  // 1. Update status di Database
  // Kita perlu mengambil data lama dulu untuk di-merge, atau update partial json jika Prisma versi baru mendukung
  const node = await prisma.node.findUnique({ where: { id: nodeId } });
  const currentData = (node?.data as Record<string, any>) || {};

  await prisma.node.update({
    where: { id: nodeId },
    data: {
      data: {
        ...currentData,
        isActive, // Set status true/false di DB
        videoId, // Pastikan videoId tersimpan
        pollingInterval,
      },
    },
  });

  // 2. Jika diaktifkan (Continue), trigger event Inngest pertama kali
  if (isActive && videoId) {
    await inngest.send({
      name: "trigger/youtube.poll",
      data: {
        nodeId,
        videoId,
        pollingInterval,
      },
    });
  }

  return { success: true };
}
