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
import { youtubeDeleteChannel } from "./channels/youtube-delete";

const getDescendants = (
  nodes: any[],
  connections: any[],
  startNodeId: string,
  outputHandle: string
) => {
  const descendants = new Set<string>();
  const queue = [{ nodeId: startNodeId, outputHandle }];

  while (queue.length > 0) {
    const { nodeId, outputHandle } = queue.shift()!;

    // Cari koneksi yang keluar dari node ini lewat handle spesifik
    const outgoing = connections.filter(
      (c) =>
        c.fromNodeId === nodeId &&
        (outputHandle ? c.fromOutput === outputHandle : true)
    );

    for (const conn of outgoing) {
      if (!descendants.has(conn.toNodeId)) {
        descendants.add(conn.toNodeId);
        // Untuk node berikutnya, kita ambil semua outputnya (karena cabangnya sudah mati)
        queue.push({ nodeId: conn.toNodeId, outputHandle: null as any });
      }
    }
  }
  return descendants;
};

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
      youtubeDeleteChannel(),
    ],
  },
  async ({ event, step, publish }) => {
    const inngestEventId = event.id;
    const workflowId = event.data.workflowId;

    if (!workflowId || !inngestEventId) {
      throw new NonRetriableError("N o workflow ID provided");
    }

    await step.run("create-execution", async () => {
      return prisma.execution.create({
        data: {
          workflowId,
          inngestEventId,
        },
      });
    });

    const workflow = await step.run("load-workflow-data", async () => {
      return prisma.workflow.findUniqueOrThrow({
        where: { id: workflowId },
        include: { nodes: true, connections: true },
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
    const skippedNodeIds = new Set<string>(); // Track node yang di-skip

    // execute each node
    for (const node of sortedNodes) {
      // 1. Cek apakah node ini harus di-skip
      if (skippedNodeIds.has(node.id)) {
        continue;
      }

      const executor = getExecutor(node.type as NodeType);
      context = await executor({
        data: node.data as Record<string, unknown>,
        nodeId: node.id,
        context,
        userId,
        step,
        publish,
      });

      // 2. LOGIKA DECISION NODE
      // C. Logika Khusus DECISION NODE
      if (node.type === "DECISION") {
        const nodeData = node.data as Record<string, any>;

        // Fallback ke 'decision' jika user lupa isi variableName di UI
        const variableName = nodeData.variableName || "decision";

        console.log("variabel name = ", variableName);

        // Ambil hasil dari context
        const executionResult = (context as any)[variableName];

        // DEBUGGING: Cek kenapa undefined
        if (!executionResult) {
          console.error(
            `[Decision Node] ❌ ERROR: Variable '${variableName}' tidak ditemukan di context!`
          );
          console.log(
            `[Decision Node] ℹ️ Keys yang tersedia di context:`,
            Object.keys(context)
          );

          // Lempar error agar execution status jadi FAILED dan kita sadar ada masalah
          throw new NonRetriableError(
            `Decision Node Error: Variable '${variableName}' not found in context. Please check your Decision Node configuration.`
          );
        }

        const decisionResult = executionResult.result; // Harus boolean true/false

        console.log(
          `[Decision Node] ✅ Evaluasi '${variableName}':`,
          decisionResult
        );

        // Tentukan jalur yang MATI (Inactive)
        // Jika True -> Jalur 'false' dimatikan
        // Jika False -> Jalur 'true' dimatikan
        const inactiveHandle = decisionResult ? "false" : "true";

        // Cari semua anak-cucu di jalur yang mati
        const nodesToSkip = getDescendants(
          workflow.nodes,
          workflow.connections,
          node.id,
          inactiveHandle
        );

        nodesToSkip.forEach((id) => skippedNodeIds.add(id));

        console.log(
          `[Decision Node] 🚫 Skipping ${nodesToSkip.size} nodes di jalur '${inactiveHandle}'`
        );
      }
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

      if (!liveChatId) {
        throw new NonRetriableError(
          "Live chat ID not found for the given video ID"
        );
      }

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
