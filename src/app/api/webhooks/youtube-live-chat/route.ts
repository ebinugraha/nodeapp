import { sendWorkflowExecution } from "@/lib/send-workflow-execution";
import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { videoId, workflowId: nodeId } = body; // Di frontend kita kirim node ID sebagai workflowId sementara untuk lookup

    if (!videoId || !nodeId) {
      return NextResponse.json(
        { success: false, error: "Missing data" },
        { status: 400 }
      );
    }

    // 1. Cari workflow ID yang sebenarnya berdasarkan Node ID
    const node = await prisma.node.findUnique({
      where: { id: nodeId },
      select: { workflowId: true },
    });

    if (!node) {
      return NextResponse.json(
        { success: false, error: "Node not found" },
        { status: 404 }
      );
    }

    // 2. Fetch Live Chat ID dari YouTube API
    const apiKey = process.env.GOOGLE_API_KEY;
    const videoUrl = `https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id=${videoId}&key=${apiKey}`;

    const videoRes = await fetch(videoUrl);
    const videoData = await videoRes.json();

    const liveChatId =
      videoData.items?.[0]?.liveStreamingDetails?.activeLiveChatId;

    if (!liveChatId) {
      // Mungkin stream offline atau tidak live, kita skip error untuk mencegah spam error di UI
      return NextResponse.json({
        success: true,
        message: "No active live chat found",
      });
    }

    // 3. Fetch Messages
    // Note: Di production, Anda harus menyimpan `nextPageToken` di database (misal di kolom data Node)
    // agar tidak mengambil pesan yang sama berulang kali.
    const chatUrl = `https://www.googleapis.com/youtube/v3/liveChat/messages?liveChatId=${liveChatId}&part=snippet,authorDetails&key=${apiKey}`;
    const chatRes = await fetch(chatUrl);
    const chatData = await chatRes.json();

    const messages = chatData.items || [];

    if (messages.length === 0) {
      return NextResponse.json({ success: true, message: "No new messages" });
    }

    // 4. Trigger Workflow untuk SETIAP pesan baru (atau batch, tergantung kebutuhan)
    // Disini kita ambil pesan terakhir saja sebagai contoh trigger per interval
    const lastMessage = messages[messages.length - 1];

    const payload = {
      message: lastMessage.snippet.displayMessage,
      author: lastMessage.authorDetails.displayName,
      publishedAt: lastMessage.snippet.publishedAt,
      raw: lastMessage,
    };

    await sendWorkflowExecution({
      workflowId: node.workflowId,
      initialData: {
        youtubeLiveChat: payload,
      },
    });

    return NextResponse.json({ success: true, processed: 1 });
  } catch (error) {
    console.error("Error polling YouTube:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
