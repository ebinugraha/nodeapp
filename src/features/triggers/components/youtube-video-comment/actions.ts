"use server";

import { youtubeVideoCommentChannel } from "@/inngest/channels/youtube-video-comment";
import { inngest } from "@/inngest/client";
import prisma from "@/lib/db";
import { getSubscriptionToken, Realtime } from "@inngest/realtime";

export type YoutubeVideoCommentToken = Realtime.Token<
  typeof youtubeVideoCommentChannel,
  ["status"]
>;

export async function fetchYoutubeVideoCommentToken(): Promise<YoutubeVideoCommentToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: youtubeVideoCommentChannel(),
    topics: ["status"],
  });
  return token;
}

export async function toggleYoutubeVideoPolling(
  nodeId: string,
  isActive: boolean,
  videoId?: string,
  pollingInterval: number = 60,
  credentialId?: string
) {
  // 1. Cek dulu apakah Node sudah ada di database (Mencegah Error Crash)
  const node = await prisma.node.findUnique({ where: { id: nodeId } });

  if (!node) {
    throw new Error(
      "Node not found in database. Please SAVE the workflow first!"
    );
  }

  const currentData = (node.data as Record<string, any>) || {};

  await prisma.node.update({
    where: { id: nodeId },
    data: {
      // [PERBAIKAN 1]: Update Relasi Foreign Key (Wajib agar Inngest bisa baca)
      credentialId: credentialId,

      // Update JSON Data (Untuk UI)
      data: {
        ...currentData,
        isActive,
        videoId,
        pollingInterval,
        credentialId,
      },
    },
  });

  if (isActive && videoId && credentialId) {
    await inngest.send({
      name: "trigger/youtube-video.poll",
      data: {
        nodeId,
        videoId,
        pollingInterval,
        credentialId, // Kirim juga ID-nya untuk konsistensi event
      },
    });
  }

  return { success: true };
}
