"use server";

import { youtubeDeleteChannel } from "@/inngest/channels/youtube-delete";
import { inngest } from "@/inngest/client";
import { getSubscriptionToken, Realtime } from "@inngest/realtime";

// Definisikan tipe token agar sesuai dengan channel delete
export type YoutubeDeleteToken = Realtime.Token<
  typeof youtubeDeleteChannel,
  ["status"]
>;

export async function fetchYoutubeDeleteToken(): Promise<YoutubeDeleteToken> {
  // [PENTING] Menggunakan channel yang benar: youtubeDeleteChannel
  const token = await getSubscriptionToken(inngest, {
    channel: youtubeDeleteChannel(),
    topics: ["status"],
  });

  return token;
}
