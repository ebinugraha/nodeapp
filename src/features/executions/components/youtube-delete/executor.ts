import { NodeExecutor } from "@/features/executions/type";
import { youtubeDeleteChannel } from "@/inngest/channels/youtube-delete";
import { NonRetriableError } from "inngest";
import prisma from "@/lib/db";
import Handlebars from "handlebars";
import ky, { HTTPError } from "ky";

type YoutubeDeleteData = {
  credentialId?: string;
  messageId?: string;
};

export const YoutubeDeleteExecutor: NodeExecutor<YoutubeDeleteData> = async ({
  data,
  nodeId,
  context,
  userId,
  publish,
}) => {
  // 1. Validasi Data Awal
  if (!data.credentialId) throw new NonRetriableError("Credential is required");
  if (!data.messageId) throw new NonRetriableError("Message ID is required");

  // 2. Ambil Credential
  const credential = await prisma.credential.findUnique({
    where: { id: data.credentialId, userId },
  });

  if (!credential) throw new NonRetriableError("Credential not found in DB");

  const messageId = Handlebars.compile(data.messageId)(context);

  try {
    // 3. Eksekusi Hapus ke YouTube
    await ky.delete(`https://www.googleapis.com/youtube/v3/liveChat/messages`, {
      searchParams: { id: messageId },
      headers: {
        Authorization: `Bearer ${credential.value}`,
        Accept: "application/json",
      },
    });

    // Jika berhasil
    await publish(youtubeDeleteChannel().status({ nodeId, status: "success" }));
    return {
      ...context,
      youtubeDelete: { deletedId: messageId, success: true },
    };
  } catch (err: any) {
    // 4. Handling Error Spesifik
    if (err instanceof HTTPError) {
      const status = err.response.status;

      // Kasus A: Pesan sudah hilang (404) -> Anggap SUKSES
      if (status === 404) {
        console.log(`[YoutubeDelete] Message ${messageId} already gone (404).`);
        await publish(
          youtubeDeleteChannel().status({ nodeId, status: "success" })
        );
        return {
          ...context,
          youtubeDelete: {
            deletedId: messageId,
            success: true,
            note: "Already deleted",
          },
        };
      }

      // Kasus B: Credential Salah/Expired (401/403) -> Anggap ERROR FATAL
      if (status === 401 || status === 403) {
        console.error(`[YoutubeDelete] Auth Error: ${status}`);

        // Kirim sinyal merah ke UI
        await publish(
          youtubeDeleteChannel().status({ nodeId, status: "error" })
        );

        // Throw error spesifik agar Inngest mencatatnya sebagai kegagalan
        throw new NonRetriableError(
          `YouTube Auth Failed (${status}). Check your credential.`
        );
      }
    }

    // Error lainnya (Server error, network, dll)
    console.error("[YoutubeDelete] Unknown Error:", err);
    await publish(youtubeDeleteChannel().status({ nodeId, status: "error" }));
    throw err;
  }
};
