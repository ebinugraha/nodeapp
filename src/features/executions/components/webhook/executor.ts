import { NodeExecutor } from "@/features/executions/type";
import { NonRetriableError } from "inngest";

type WebhookData = {
  variableName?: string;
  url?: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: { key: string; value: string }[];
  bodyTemplate?: string;
};

type YouTubeCommentData = {
  author?: string;
  text?: string;
  message?: string;
  videoId?: string;
};

export const WebhookExecutor: NodeExecutor<WebhookData> = async ({
  data,
  context,
  step,
}) => {
  return step.run("webhook-out", async () => {
    const url = data.url;

    if (!url) {
      throw new NonRetriableError("Webhook URL is required");
    }

    const commentData = (context.YOUTUBE_VIDEO_COMMENT || context.YOUTUBE_LIVE_CHAT) as YouTubeCommentData | undefined;

    // Compile body template
    let body = data.bodyTemplate || JSON.stringify(context);
    body = body
      .replace(/\{\{author\}\}/g, commentData?.author || "")
      .replace(/\{\{comment\}\}/g, commentData?.text || commentData?.message || "")
      .replace(/\{\{videoId\}\}/g, commentData?.videoId || "");

    // Build headers
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    (data.headers || []).forEach((h) => {
      headers[h.key] = h.value;
    });

    const method = data.method || "POST";

    const response = await fetch(url, {
      method,
      headers,
      body: ["POST", "PUT", "PATCH"].includes(method) ? body : undefined,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new NonRetriableError(`Webhook failed: ${response.status} - ${error}`);
    }

    const responseData = await response.json().catch(() => response.text());

    return {
      ...context,
      [data.variableName || "webhookResult"]: {
        success: true,
        status: response.status,
        response: responseData,
        timestamp: new Date().toISOString(),
      },
    };
  });
};