import { NodeExecutor } from "@/features/executions/type";
import { youtubeLiveChatChannel } from "@/inngest/channels/youtube-live-chat";

type YoutubeData = Record<string, unknown>;

export const YoutubeLiveChatExecutor: NodeExecutor<YoutubeData> = async ({
  nodeId,
  context,
  step,
}) => {
  // Update status loading
  await step.realtime.publish(
    `yt-live-${nodeId}-loading`,
    youtubeLiveChatChannel.status,
    { nodeId, status: "loading" },
  );

  // Pass data chat ke langkah berikutnya
  const result = await step.run("youtube-chat-trigger", async () => context);

  // Update status success
  await step.realtime.publish(
    `yt-live-${nodeId}-success`,
    youtubeLiveChatChannel.status,
    { nodeId, status: "success" },
  );

  return result;
};
