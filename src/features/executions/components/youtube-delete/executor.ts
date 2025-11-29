import { NodeExecutor } from "@/features/executions/type";
import { youtubeDeleteChannel } from "@/inngest/channels/youtube-delete";
import { NonRetriableError } from "inngest";
import prisma from "@/lib/db";
import Handlebars from "handlebars";
import ky, { HTTPError } from "ky";

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
  try {
    if (!data.credentialId) {
      await publish(youtubeDeleteChannel().status({ nodeId, status: "error" }));
      throw new NonRetriableError("Credential is required");
    }
    if (!data.messageId) {
      throw new NonRetriableError("Message ID is required");
    }

    const credential = await prisma.credential.findUnique({
      where: { id: data.credentialId, userId },
    });

    if (!credential) {
      await publish(youtubeDeleteChannel().status({ nodeId, status: "error" }));
      throw new NonRetriableError("Credential not found");
    }

    // --- [PERBAIKAN DIMULAI DISINI] ---
    // Kita harus parse JSON untuk mendapatkan access_token
    let accessToken = "";
    try {
      const tokenData = JSON.parse(credential.value);
      accessToken = tokenData.access_token;
    } catch (e) {
      // Jika gagal parse, lempar error karena format baru wajib JSON OAuth
      throw new NonRetriableError(
        "Invalid credential format. Please reconnect your YouTube account."
      );
    }

    if (!accessToken) {
      throw new NonRetriableError(
        "Access token missing. Please reconnect your YouTube account."
      );
    }
    // --- [PERBAIKAN SELESAI] ---

    const messageId = Handlebars.compile(data.messageId)(context);
    const targetType = data.targetType || "live-chat";

    let endpoint = "";
    if (targetType === "comment") {
      endpoint = "https://www.googleapis.com/youtube/v3/comments";
    } else {
      endpoint = "https://www.googleapis.com/youtube/v3/liveChat/messages";
    }

    try {
      await ky.delete(endpoint, {
        searchParams: {
          id: messageId,
        },
        headers: {
          // Gunakan variable accessToken yang sudah di-parse
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      });
    } catch (err) {
      // Handle 404 (Not Found) -> Anggap Sukses
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
      throw err;
    }

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

    if (error instanceof HTTPError && error.response.status === 401) {
      throw new NonRetriableError(
        "YouTube Access Token Expired. Please reconnect your account in the Credentials menu."
      );
    }

    throw error;
  }
};
