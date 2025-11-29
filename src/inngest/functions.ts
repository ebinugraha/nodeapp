import { NonRetriableError } from "inngest";
import { inngest } from "./client";
import prisma from "@/lib/db";
import { topologicalSort } from "@/lib/topologicalSort";
import { ExecutionStatus, NodeType } from "@/generated/prisma";
import { getExecutor } from "@/features/executions/lib/executor-register";
import { httpRequestChannel } from "./channels/http-request";
import { manualTriggerChannel } from "./channels/manual-trigger";
import { geminiExecutionChannel } from "./channels/gemini";
import { discordExecutionChannel } from "./channels/discord";
import { youtubeLiveChatChannel } from "./channels/youtube-live-chat";
import { youtubeDeleteChannel } from "./channels/youtube-delete";
import { youtubeVideoCommentChannel } from "./channels/youtube-video-comment";
import { googleSheetsChannel } from "./channels/google-sheets";

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
      youtubeVideoCommentChannel(),
      geminiExecutionChannel(),
      discordExecutionChannel(),
      youtubeLiveChatChannel(),
      youtubeDeleteChannel(),
      googleSheetsChannel(),
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

// --- FUNCTION 2: POLL YOUTUBE LIVE CHAT (DIUBAH KE OAUTH) ---
export const pollYoutubeLiveChat = inngest.createFunction(
  { id: "poll-youtube-live-chat" },
  { event: "trigger/youtube.poll" },
  async ({ event, step }) => {
    const { nodeId, videoId, pollingInterval } = event.data;

    // 1. Cek status node & AMBIL CREDENTIAL (OAUTH)
    const { isActive, workflowId, credential } = await step.run(
      "check-node-status",
      async () => {
        const node = await prisma.node.findUnique({
          where: { id: nodeId },
          select: {
            data: true,
            workflowId: true,
            credential: true, // [BARU] Ambil relasi credential
          },
        });

        if (!node)
          return { isActive: false, workflowId: null, credential: null };

        const data = node.data as { isActive?: boolean };
        return {
          isActive: data?.isActive ?? false,
          workflowId: node.workflowId,
          credential: node.credential,
        };
      }
    );

    if (!isActive || !workflowId || !credential) {
      return { status: "stopped" };
    }

    // 2. Parse Token User
    const accessToken = await step.run("get-access-token", async () => {
      try {
        const tokenData = JSON.parse(credential.value);
        return tokenData.access_token;
      } catch (e) {
        throw new NonRetriableError("Invalid OAuth credential format");
      }
    });

    const lastTimestamp = await step.run("load-last-timestamp", async () => {
      return (event.data.lastTimestamp ?? null) as string | null;
    });

    // 3. Fetch YouTube messages MENGGUNAKAN TOKEN
    const messages = await step.run("fetch-youtube-messages", async () => {
      const headers = { Authorization: `Bearer ${accessToken}` }; // [BARU]

      // Fetch Video Details
      const videoRes = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id=${videoId}`,
        { headers }
      );

      if (!videoRes.ok) throw new Error("Failed to fetch video details");

      const videoData = await videoRes.json();
      const liveChatId =
        videoData.items?.[0]?.liveStreamingDetails?.activeLiveChatId;

      if (!liveChatId) {
        throw new NonRetriableError("Live chat ID not found. Is stream live?");
      }

      // Fetch Chat Messages
      const chatRes = await fetch(
        `https://www.googleapis.com/youtube/v3/liveChat/messages?liveChatId=${liveChatId}&part=snippet,authorDetails`,
        { headers }
      );

      if (!chatRes.ok) throw new Error("Failed to fetch chat messages");

      const chatData = await chatRes.json();
      return chatData.items || [];
    });

    // 4. Filter Pesan Baru (Logic lama)
    const newMessages = messages.filter((m: any) => {
      const ts = m.snippet.publishedAt;
      return !lastTimestamp || ts > lastTimestamp;
    });

    // 5. Trigger workflow
    if (newMessages.length > 0) {
      const newest = newMessages[newMessages.length - 1];
      await step.sendEvent("trigger-workflow-execution", {
        name: "workflows/execute.workflow",
        data: {
          workflowId,
          initialData: {
            YOUTUBE_LIVE_CHAT: {
              message: newest.snippet.displayMessage,
              author: newest.authorDetails.displayName,
              publishedAt: newest.snippet.publishedAt,
              raw: newest,
            },
          },
        },
      });
    }

    // 6. Next Polling
    const latestTimestamp =
      messages[messages.length - 1]?.snippet.publishedAt ?? lastTimestamp;
    await step.sleep("wait-interval", pollingInterval * 1000);
    await step.sendEvent("continue-polling", {
      name: "trigger/youtube.poll",
      data: {
        nodeId,
        videoId,
        pollingInterval,
        lastTimestamp: latestTimestamp,
      },
    });

    return { status: "polling-continued", newMessages: newMessages.length };
  }
);

// --- FUNCTION 3: POLL YOUTUBE VIDEO COMMENTS (DIUBAH KE OAUTH) ---
export const pollYoutubeVideoComments = inngest.createFunction(
  { id: "poll-youtube-video-comments" },
  { event: "trigger/youtube-video.poll" },
  async ({ event, step }) => {
    const { nodeId, videoId, pollingInterval = 60, credentialId } = event.data;

    // 1. Cek Status & CREDENTIAL (OAUTH)
    const { isActive, workflowId, credential } = await step.run(
      "check-status",
      async () => {
        const node = await prisma.node.findUnique({
          where: { id: nodeId },
          select: {
            data: true,
            workflowId: true,
            credential: true, // [BARU]
          },
        });
        if (!node)
          return { isActive: false, workflowId: null, credential: null };
        const data = node.data as { isActive?: boolean };
        return {
          isActive: data?.isActive ?? false,
          workflowId: node.workflowId,
          credential: node.credential,
        };
      }
    );

    if (!isActive || !workflowId || !credential) {
      return { status: "stopped" };
    }

    // 2. Parse Token
    const accessToken = await step.run("get-token", async () => {
      try {
        const tokenData = JSON.parse(credential.value);
        return tokenData.access_token;
      } catch (e) {
        throw new NonRetriableError("Invalid OAuth credential format");
      }
    });

    const lastTimestamp = await step.run("load-timestamp", async () => {
      return (event.data.lastTimestamp ?? null) as string | null;
    });

    // 3. Fetch Comments VIA TOKEN
    const comments = await step.run("fetch-comments", async () => {
      // HAPUS GOOGLE_API_KEY
      const url = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&order=time&maxResults=20`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`, // [BARU] Pakai Token User
          Accept: "application/json",
        },
      });

      const data = await res.json();
      if (data.error)
        throw new Error(`YouTube API Error: ${data.error.message}`);
      return data.items || [];
    });

    // 4. Filter Komentar Baru
    const newComments = comments.filter((item: any) => {
      const publishedAt = item.snippet.topLevelComment.snippet.publishedAt;
      if (!lastTimestamp) return false; // Skip run pertama agar tidak spam
      return publishedAt > lastTimestamp;
    });

    // 5. Trigger Workflow (Looping)
    const sortedNewComments = newComments.sort(
      (a: any, b: any) =>
        new Date(a.snippet.topLevelComment.snippet.publishedAt).getTime() -
        new Date(b.snippet.topLevelComment.snippet.publishedAt).getTime()
    );

    for (const comment of sortedNewComments) {
      const snippet = comment.snippet.topLevelComment.snippet;
      await step.sendEvent("trigger-workflow", {
        name: "workflows/execute.workflow",
        data: {
          workflowId,
          initialData: {
            YOUTUBE_VIDEO_COMMENT: {
              commentId: comment.id,
              text: snippet.textDisplay,
              author: snippet.authorDisplayName,
              publishedAt: snippet.publishedAt,
              raw: comment,
            },
          },
        },
      });
    }

    // 6. Next Poll
    const newestCommentTime =
      comments.length > 0
        ? comments[0].snippet.topLevelComment.snippet.publishedAt
        : lastTimestamp;
    const nextTimestamp = lastTimestamp || new Date().toISOString();

    await step.sleep("wait-interval", pollingInterval * 1000);
    await step.sendEvent("continue-polling", {
      name: "trigger/youtube-video.poll",
      data: {
        nodeId,
        videoId,
        pollingInterval,
        lastTimestamp: newestCommentTime || nextTimestamp,
      },
    });

    return { processed: newComments.length };
  }
);
