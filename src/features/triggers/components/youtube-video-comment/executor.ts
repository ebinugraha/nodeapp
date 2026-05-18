import { NodeExecutor } from "@/features/executions/type";
import { inngest } from "@/inngest/client";
import { youtubeVideoCommentChannel } from "@/inngest/channels/youtube-video-comment";

export const YoutubeVideoCommentExecutor: NodeExecutor<
  Record<string, unknown>
> = async ({ nodeId, context, step }) => {
  await inngest.realtime.publish(youtubeVideoCommentChannel.status, {
    nodeId,
    status: "loading",
  });
  // Pass data dari trigger (Inngest) ke node berikutnya
  const result = await step.run("youtube-video-trigger", async () => context);
  await inngest.realtime.publish(youtubeVideoCommentChannel.status, {
    nodeId,
    status: "success",
  });
  return result;
};
