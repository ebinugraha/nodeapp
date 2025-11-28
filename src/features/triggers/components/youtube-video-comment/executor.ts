import { NodeExecutor } from "@/features/executions/type";
import { youtubeVideoCommentChannel } from "@/inngest/channels/youtube-video-comment";

export const YoutubeVideoCommentExecutor: NodeExecutor<
  Record<string, unknown>
> = async ({ nodeId, context, publish, step }) => {
  await publish(
    youtubeVideoCommentChannel().status({ nodeId, status: "loading" })
  );
  // Pass data dari trigger (Inngest) ke node berikutnya
  const result = await step.run("youtube-video-trigger", async () => context);
  await publish(
    youtubeVideoCommentChannel().status({ nodeId, status: "success" })
  );
  return result;
};
