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
  pollingInterval: number = 60
) {
  const node = await prisma.node.findUnique({ where: { id: nodeId } });
  const currentData = (node?.data as Record<string, any>) || {};

  await prisma.node.update({
    where: { id: nodeId },
    data: {
      data: {
        ...currentData,
        isActive,
        videoId,
        pollingInterval,
      },
    },
  });

  if (isActive && videoId) {
    // Trigger event baru khusus untuk video comment
    await inngest.send({
      name: "trigger/youtube-video.poll", // Event name baru
      data: {
        nodeId,
        videoId,
        pollingInterval,
      },
    });
  }

  return { success: true };
}
