import { NodeExecutor } from "@/features/executions/type";
import { youtubeDeleteChannel } from "@/inngest/channels/youtube-delete";
import { NonRetriableError } from "inngest";
import prisma from "@/lib/db";
import Handlebars from "handlebars";
import ky, { HTTPError } from "ky"; // Pastikan import HTTPError

type YoutubeDeleteData = {
  credentialId?: string;
  messageId?: string;
  targetType?: "live-chat" | "comment";
};

export const YoutubeDeleteExecutor: NodeExecutor<YoutubeDeleteData> = async ({
  data,
  nodeId,
  context,
  userId,
  publish,
}) => {
  // Kita skip status 'loading' untuk menghindari warning Inngest "Same Step ID"
  // jika publish dipanggil berulang kali dengan ID yang sama

  try {
    if (!data.credentialId) {
      await publish(
        youtubeDeleteChannel().status({
          nodeId,
          status: "error",
        })
      );
      throw new NonRetriableError("Credential is required");
    }
    if (!data.messageId) {
      throw new NonRetriableError("Message ID is required");
    }

    const credential = await prisma.credential.findUnique({
      where: { id: data.credentialId, userId },
    });

    if (!credential) {
      await publish(
        youtubeDeleteChannel().status({
          nodeId,
          status: "error",
        })
      );
      throw new NonRetriableError("Credential not found");
    }

    const messageId = Handlebars.compile(data.messageId)(context);
    const targetType = data.targetType || "live-chat";

    let endpoint = "";
    if (targetType === "comment") {
      endpoint = "https://www.googleapis.com/youtube/v3/comments";
    } else {
      endpoint = "https://www.googleapis.com/youtube/v3/liveChat/messages";
    }

    // --- PERBAIKAN UTAMA DI SINI ---
    try {
      await ky.delete(endpoint, {
        searchParams: {
          id: messageId,
        },
        headers: {
          Authorization: `Bearer ${credential.value}`,
          Accept: "application/json",
        },
      });
    } catch (err) {
      // Jika errornya adalah 404 (Not Found), berarti pesan sudah hilang.
      // Kita anggap ini SUKSES agar workflow tidak berhenti/failed.
      if (err instanceof HTTPError && err.response.status === 404) {
        console.log(
          `Message ${messageId} already deleted or not found. Skipping.`
        );

        await publish(
          youtubeDeleteChannel().status({ nodeId, status: "success" })
        );
        return {
          ...context,
          youtubeDelete: {
            deletedId: messageId,
            success: true,
            note: "Message was already deleted (404)",
          },
        };
      }

      // Jika error lain (misal 401 Unauthorized / 403 Forbidden), lempar errornya
      throw err;
    }
    // -------------------------------

    await publish(youtubeDeleteChannel().status({ nodeId, status: "success" }));

    return {
      ...context,
      youtubeDelete: {
        deletedId: messageId,
        success: true,
      },
    };
  } catch (error: any) {
    console.error("YouTube Delete Error:", error);
    await publish(youtubeDeleteChannel().status({ nodeId, status: "error" }));

    // Jika token expired (401), beri pesan yang jelas
    if (error instanceof HTTPError && error.response.status === 401) {
      throw new NonRetriableError(
        "YouTube Access Token Expired. Please update credential."
      );
    }

    throw error;
  }
};
