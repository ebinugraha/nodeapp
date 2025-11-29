import { NodeExecutor } from "@/features/executions/type";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";
import Handlebars from "handlebars";
import { httpRequestChannel } from "@/inngest/channels/http-request";

Handlebars.registerHelper("json", (context) => {
  const stringified = JSON.stringify(context, null, 2);
  return new Handlebars.SafeString(stringified);
});

type HTTPRequestData = {
  variableName?: string;
  endPoint?: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  bodyPairs?: { key: string; value: string }[]; // Data dari Key-Value Builder
  body?: string; // Data legacy (diabaikan)
};

export const httpRequestExecutor: NodeExecutor<HTTPRequestData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(
    httpRequestChannel().status({
      nodeId,
      status: "loading",
    })
  );

  try {
    const result = await step.run("http-request", async () => {
      // 1. Validasi Input
      if (!data.endPoint) {
        throw new NonRetriableError("No endpoint provided for HTTP request");
      }
      if (!data.variableName) {
        throw new NonRetriableError(
          "No variable name provided for HTTP request"
        );
      }
      if (!data.method) {
        throw new NonRetriableError("No method provided for HTTP request");
      }

      // 2. Compile URL
      const endpoint = Handlebars.compile(data.endPoint)(context);
      const method = data.method;

      // 3. Rakit JSON dari Key-Value Pairs
      let bodyPayload: any = {};

      if (data.bodyPairs && Array.isArray(data.bodyPairs)) {
        for (const pair of data.bodyPairs) {
          if (!pair.key) continue; // Skip jika key kosong

          // Compile value (ubah {{variable}} jadi data asli)
          const compiledValue = Handlebars.compile(pair.value)(context);
          console.log(compiledValue);
          bodyPayload[pair.key] = compiledValue;
        }
      }

      const options: KyOptions = { method };

      console.log("HTTP REQUEST BODY PAYLOAD:", bodyPayload);

      // 4. Pasang Body (Tanpa validasi JSON.parse manual lagi!)
      if (["POST", "PUT", "PATCH"].includes(method)) {
        options.json = bodyPayload; // ky akan otomatis stringify ini
        options.headers = {
          "Content-Type": "application/json",
        };
      }

      // 5. Kirim Request
      const response = await ky(endpoint, options);

      // 6. Baca Response
      const contentType = response.headers.get("content-type");
      const responseData = contentType?.includes("application/json")
        ? await response.json()
        : await response.text();

      const responsePayload = {
        httpResponse: {
          status: response.status,
          statusText: response.statusText,
          data: responseData,
        },
      };

      return {
        ...context,
        [data.variableName]: responsePayload,
      };
    });

    await publish(
      httpRequestChannel().status({
        nodeId,
        status: "success",
      })
    );
    return result;
  } catch (error: any) {
    console.error("HTTP Request Error:", error);
    await publish(
      httpRequestChannel().status({
        nodeId,
        status: "error",
      })
    );
    throw error;
  }
};
