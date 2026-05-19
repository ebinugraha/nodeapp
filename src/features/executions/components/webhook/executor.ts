import { NodeExecutor } from "@/features/executions/type";
import { NonRetriableError } from "inngest";
import { compileTemplate } from "@/features/executions/lib/template";

type WebhookData = {
  variableName?: string;
  url?: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: { key: string; value: string }[];
  bodyTemplate?: string;
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

    // Compile body template
    const body = compileTemplate(data.bodyTemplate, context) || JSON.stringify(context);

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