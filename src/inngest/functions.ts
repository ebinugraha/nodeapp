import { NonRetriableError } from "inngest";
import { inngest } from "./client";
import prisma from "@/lib/db";
import { topologicalSort } from "@/lib/topologicalSort";
import { ExecutionStatus, NodeType } from "@/generated/prisma";
import { getExecutor } from "@/features/executions/lib/executor-register";
import { httpRequestChannel } from "./channels/http-request";
import { manualTriggerChannel } from "./channels/manual-trigger";
import { googleFormTriggerChannel } from "./channels/google-form-trigger";
import { stripeTriggerChannel } from "./channels/stripe-trigger";
import { geminiExecutionChannel } from "./channels/gemini";
import { discordExecutionChannel } from "./channels/discord";
import { youtubeLiveChatChannel } from "./channels/youtube-live-chat";

export const executeWorkflow = inngest.createFunction(
  {
    id: "execute-workflow",
    retries: 0,
    onFailure: async ({ event, step }) => {
      return prisma.execution.update({
        where: { inngestEventId: event.data.event.id },
        data: {
          status: ExecutionStatus.FAILED,
          error: event.data.error.message,
          errorStack: event.data.error.stack,
        },
      });
    },
  },
  {
    event: "workflows/execute.workflow",
    channels: [
      httpRequestChannel(),
      manualTriggerChannel(),
      googleFormTriggerChannel(),
      stripeTriggerChannel(),
      geminiExecutionChannel(),
      discordExecutionChannel(),
      youtubeLiveChatChannel(),
    ],
  },
  async ({ event, step, publish }) => {
    const inngestEventId = event.id;
    const workflowId = event.data.workflowId;

    if (!workflowId || !inngestEventId) {
      throw new NonRetriableError("No workflow ID provided");
    }

    await step.run("create-execution", async () => {
      return prisma.execution.create({
        data: {
          workflowId,
          inngestEventId,
        },
      });
    });

    const sortedNodes = await step.run("prepare-workflow-node", async () => {
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: { id: workflowId },
        include: {
          nodes: true,
          connections: true,
        },
      });

      return topologicalSort(workflow.nodes, workflow.connections);
    });

    const userId = await step.run("find-user-id", async () => {
      const workflow = await prisma.workflow.findUniqueOrThrow({
        where: { id: workflowId },
        select: {
          userId: true,
        },
      });

      return workflow.userId;
    });

    let context = event.data.initialData || {};

    // execute each node
    for (const node of sortedNodes) {
      const executor = getExecutor(node.type as NodeType);
      context = await executor({
        data: node.data as Record<string, unknown>,
        nodeId: node.id,
        context,
        userId,
        step,
        publish,
      });
    }

    await step.run("update-execution", async () => {
      return prisma.execution.update({
        where: { inngestEventId, workflowId },
        data: {
          status: ExecutionStatus.SUCCESS,
          completedAt: new Date(),
          output: context,
        },
      });
    });

    return { workflowId, result: context };
  }
);

// Tambahkan function baru ini
// Tambahkan function baru ini
export const pollYoutubeLiveChat = inngest.createFunction(
  { id: "poll-youtube-live-chat" },
  { event: "trigger/youtube.poll" },
  async ({ event, step }) => {
    const nodeId = event.data.nodeId;
    const videoId = event.data.videoId;
    const pollingInterval = event.data.pollingInterval;

    // 1. Cek status node (pause / continue)
    const { isActive, workflowId } = await step.run(
      "check-node-status",
      async () => {
        const node = await prisma.node.findUnique({
          where: { id: nodeId },
          select: { data: true, workflowId: true },
        });

        if (!node) return { isActive: false, workflowId: null };

        const data = node.data as { isActive?: boolean } | null;
        return {
          isActive: data?.isActive ?? false,
          workflowId: node.workflowId,
        };
      }
    );

    if (!isActive || !workflowId) {
      return { status: "stopped" };
    }

    // 2. Ambil last timestamp message dari run state
    const lastTimestamp = await step.run("load-last-timestamp", async () => {
      return (event.data.lastTimestamp ?? null) as string | null;
    });

    // 3. Fetch YouTube messages
    const messages = await step.run("fetch-youtube-messages", async () => {
      const apiKey = process.env.GOOGLE_API_KEY;

      const videoRes = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id=${videoId}&key=${apiKey}`
      );
      const videoData = await videoRes.json();
      const liveChatId =
        videoData.items?.[0]?.liveStreamingDetails?.activeLiveChatId;

      if (!liveChatId) return [];

      const chatRes = await fetch(
        `https://www.googleapis.com/youtube/v3/liveChat/messages?liveChatId=${liveChatId}&part=snippet,authorDetails&key=${apiKey}`
      );
      const chatData = await chatRes.json();

      return chatData.items || [];
    });

    // 4. DEDUPE: Ambil HANYA pesan dengan timestamp lebih baru
    const newMessages = messages.filter((m: any) => {
      const ts = m.snippet.publishedAt;
      return !lastTimestamp || ts > lastTimestamp;
    });

    // 5. Trigger workflow hanya untuk pesan baru
    if (newMessages.length > 0) {
      const newest = newMessages[newMessages.length - 1];

      await step.sendEvent("trigger-workflow-execution", {
        name: "workflows/execute.workflow",
        data: {
          workflowId,
          initialData: {
            youtubeLiveChat: {
              message: newest.snippet.displayMessage,
              author: newest.authorDetails.displayName,
              publishedAt: newest.snippet.publishedAt,
              raw: newest,
            },
          },
        },
      });
    }

    // 6. Simpan timestamp terbaru hanya dalam event berikutnya (tanpa database!)
    const latestTimestamp =
      messages[messages.length - 1]?.snippet.publishedAt ?? lastTimestamp;

    // 7. Sleep
    await step.sleep("wait-interval", pollingInterval * 1000);

    // 8. Recursive poll
    await step.sendEvent("continue-polling", {
      name: "trigger/youtube.poll",
      data: {
        nodeId,
        videoId,
        pollingInterval,
        lastTimestamp: latestTimestamp,
      },
    });

    return {
      status: "polling-continued",
      processed: messages.length,
      newMessages: newMessages.length,
    };
  }
);
