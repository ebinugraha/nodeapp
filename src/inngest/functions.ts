import { NonRetriableError } from "inngest";
import { inngest } from "./client";
import prisma from "@/lib/db";
import { topologicalSort } from "@/lib/topologicalSort";
import { ExecutionStatus, NodeType } from "@/generated/prisma";
import { getExecutor } from "@/features/executions/lib/executor-register";
import { getOrRefreshAccessToken } from "@/lib/google-token-manager";

const getDescendants = (
  nodes: any[],
  connections: any[],
  startNodeId: string,
  outputHandle: string,
) => {
  const descendants = new Set<string>();
  const queue = [{ nodeId: startNodeId, outputHandle }];

  while (queue.length > 0) {
    const { nodeId, outputHandle } = queue.shift()!;

    // Cari koneksi yang keluar dari node ini lewat handle spesifik
    const outgoing = connections.filter(
      (c) =>
        c.fromNodeId === nodeId &&
        (outputHandle ? c.fromOutput === outputHandle : true),
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
    triggers: [{ event: "workflows/execute.workflow" }],
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
  async ({ event, step }) => {
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
            `[Decision Node] ❌ ERROR: Variable '${variableName}' tidak ditemukan di context!`,
          );
          console.log(
            `[Decision Node] ℹ️ Keys yang tersedia di context:`,
            Object.keys(context),
          );

          // Lempar error agar execution status jadi FAILED dan kita sadar ada masalah
          throw new NonRetriableError(
            `Decision Node Error: Variable '${variableName}' not found in context. Please check your Decision Node configuration.`,
          );
        }

        const decisionResult = executionResult.result; // Harus boolean true/false

        console.log(
          `[Decision Node] ✅ Evaluasi '${variableName}':`,
          decisionResult,
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
          inactiveHandle,
        );

        nodesToSkip.forEach((id) => skippedNodeIds.add(id));

        console.log(
          `[Decision Node] 🚫 Skipping ${nodesToSkip.size} nodes di jalur '${inactiveHandle}'`,
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
  },
);

// --- FUNCTION 2: POLL YOUTUBE LIVE CHAT (DIUBAH KE OAUTH) ---
// src/inngest/functions.ts

export const pollYoutubeLiveChat = inngest.createFunction(
  {
    id: "poll-youtube-live-chat",
    triggers: [{ event: "trigger/youtube.poll" }],
  },
  async ({ event, step }) => {
    const { nodeId, videoId, pollingInterval, pageToken, liveChatId } =
      event.data;

    // 1. Cek status node & AMBIL CREDENTIAL (OAUTH)
    const { isActive, workflowId, credential } = await step.run(
      "check-node-status",
      async () => {
        const node = await prisma.node.findUnique({
          where: { id: nodeId },
          select: {
            data: true,
            workflowId: true,
            credential: true,
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
      },
    );

    if (!isActive || !workflowId || !credential) {
      return { status: "stopped" };
    }

    // 2. Parse Token User
    // 2. GET VALID TOKEN (Auto Refresh Logic Here)
    const accessToken = await step.run("get-access-token", async () => {
      return await getOrRefreshAccessToken(credential.id);
    });

    // 3. Fetch YouTube messages
    // Kita definisikan tipe return agar TypeScript paham
    const result = await step.run("fetch-youtube-messages", async () => {
      const headers = { Authorization: `Bearer ${accessToken}` };

      let currentChatId = liveChatId;

      // Jika belum punya Chat ID (run pertama), cari dari Video ID
      if (!currentChatId) {
        const videoRes = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id=${videoId}`,
          { headers },
        );

        if (!videoRes.ok) {
          throw new Error(
            `Failed to fetch video details: ${videoRes.statusText}`,
          );
        }

        const videoData = await videoRes.json();
        currentChatId =
          videoData.items?.[0]?.liveStreamingDetails?.activeLiveChatId;

        // Jika tidak ada Chat ID, berarti Stream Offline
        if (!currentChatId) {
          return { isOffline: true };
        }
      }

      // Bangun URL Request
      const url = new URL(
        "https://www.googleapis.com/youtube/v3/liveChat/messages",
      );
      url.searchParams.append("liveChatId", currentChatId);
      url.searchParams.append("part", "snippet,authorDetails");

      if (pageToken) {
        url.searchParams.append("pageToken", pageToken);
      }

      const chatRes = await fetch(url.toString(), { headers });

      // Handle Token Expired / Chat Reset
      if (!chatRes.ok) {
        if ([400, 404, 410].includes(chatRes.status)) {
          return { reset: true };
        }
        throw new Error(
          `YouTube API Error: ${chatRes.status} ${chatRes.statusText}`,
        );
      }

      const data = await chatRes.json();

      return {
        isSuccess: true, // Marker untuk TypeScript
        items: data.items || [],
        nextPageToken: data.nextPageToken,
        suggestedInterval: data.pollingIntervalMillis
          ? Math.ceil(data.pollingIntervalMillis / 1000)
          : pollingInterval,
        activeLiveChatId: currentChatId,
      };
    });

    // --- Handling Hasil Fetch (Type Guarding) ---

    // Skenario A: Stream Offline
    if ("isOffline" in result && result.isOffline) {
      await step.sleep("wait-offline", 60 * 1000);
      await step.sendEvent("continue-polling", {
        name: "trigger/youtube.poll",
        data: { ...event.data, pageToken: null, liveChatId: null },
      });
      return { status: "stream-offline-retrying", newMessages: 0 };
    }

    // Skenario B: Token Error / Reset
    if ("reset" in result && result.reset) {
      await step.sendEvent("retry-reset", {
        name: "trigger/youtube.poll",
        data: { ...event.data, pageToken: null, liveChatId: null },
      });
      return { status: "resetting-state", newMessages: 0 };
    }

    // Skenario C: Sukses (Normal Flow)
    // Karena sudah melewati if di atas, TypeScript sekarang tahu ini pasti objek sukses
    // Tapi kita cast 'as any' atau cek properti agar aman 100% jika inferensi step.run hilang
    const successResult = result as any;
    const messages = successResult.items || [];

    if (messages.length > 0) {
      const events = messages.map((msg: any) => ({
        name: "workflows/execute.workflow",
        data: {
          workflowId,
          initialData: {
            YOUTUBE_LIVE_CHAT: {
              message: msg.snippet.displayMessage,
              author: msg.authorDetails.displayName,
              publishedAt: msg.snippet.publishedAt,
              raw: msg,
            },
          },
        },
      }));

      await step.sendEvent("trigger-workflow-execution", events);
    }

    const nextInterval = Math.max(
      pollingInterval,
      successResult.suggestedInterval || 0,
    );

    await step.sleep("wait-interval", nextInterval * 1000);

    await step.sendEvent("continue-polling", {
      name: "trigger/youtube.poll",
      data: {
        nodeId,
        videoId,
        pollingInterval,
        pageToken: successResult.nextPageToken,
        liveChatId: successResult.activeLiveChatId,
      },
    });

    return { status: "polling-continued", newMessages: messages.length };
  },
);

// --- FUNCTION 3: POLL YOUTUBE VIDEO COMMENTS (DIUBAH KE OAUTH) ---
export const pollYoutubeVideoComments = inngest.createFunction(
  {
    id: "poll-youtube-video-comments",
    triggers: [{ event: "trigger/youtube-video.poll" }],
  },
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
      },
    );

    if (!isActive || !workflowId || !credential) {
      return { status: "stopped" };
    }

    // 2. Parse Token
    const accessToken = await step.run("get-access-token", async () => {
      return await getOrRefreshAccessToken(credential.id);
    });

    const lastTimestamp = await step.run("load-timestamp", async () => {
      return (event.data.lastTimestamp ?? null) as string | null;
    });

    // 3. Fetch Comments VIA TOKEN
    const comments = await step.run("fetch-comments", async () => {
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
        new Date(b.snippet.topLevelComment.snippet.publishedAt).getTime(),
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
  },
);
