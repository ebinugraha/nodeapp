import { NodeExecutor } from "@/features/executions/type";
import { youtubeLiveChatChannel } from "@/inngest/channels/youtube-live-chat";

type YoutubeData = Record<string, unknown>;

export const YoutubeLiveChatExecutor: NodeExecutor<YoutubeData> = async ({
  nodeId,
  context,
  step,
  publish,
}) => {
  // 1. Update status loading
  await publish(
    youtubeLiveChatChannel().status({
      nodeId,
      status: "loading",
    })
  );

  // 2. Pass data chat ke langkah berikutnya
  const result = await step.run("youtube-chat-trigger", async () => context);

  // 3. Update status success
  await publish(
    youtubeLiveChatChannel().status({
      nodeId,
      status: "success",
    })
  );

  return result;
};
