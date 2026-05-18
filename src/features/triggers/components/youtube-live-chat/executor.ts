import { NodeExecutor } from "@/features/executions/type";
import { inngest } from "@/inngest/client";
import { youtubeLiveChatChannel } from "@/inngest/channels/youtube-live-chat";

type YoutubeData = Record<string, unknown>;

export const YoutubeLiveChatExecutor: NodeExecutor<YoutubeData> = async ({
  nodeId,
  context,
  step,
}) => {
  // 1. Update status loading
  await inngest.realtime.publish(youtubeLiveChatChannel.status, {
    nodeId,
    status: "loading",
  });

  // 2. Pass data chat ke langkah berikutnya
  const result = await step.run("youtube-chat-trigger", async () => context);

  // 3. Update status success
  await inngest.realtime.publish(youtubeLiveChatChannel.status, {
    nodeId,
    status: "success",
  });

  return result;
};
