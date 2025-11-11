import { NodeExecutor } from "@/features/executions/type";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";

type HTTPRequestData = {
  variableName?: string;
  endpoint?: string;
  method?: string;
  body?: string;
};

export const httpRequestExecutor: NodeExecutor<HTTPRequestData> = async ({
  data,
  nodeId,
  context,
  step,
}) => {
  // TODO loading state

  if (!data.endpoint) {
    throw new NonRetriableError("No endpoint provided for HTTP request");
  }

  if (!data.variableName) {
    throw new NonRetriableError("No variable name provided for HTTP request");
  }

  const result = await step.run("http-request", async () => {
    const endpoint = data.endpoint!;
    const method = data.method || "GET";

    const options: KyOptions = { method };

    if (["POST", "PUT", "PATCH"].includes(method)) {
      options.body = data.body;
      options.headers = {
        "Content-Type": "application/json",
      };
    }

    const response = await ky(endpoint, options);
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

    if (data.variableName) {
      return {
        ...context,
        [data.variableName]: responsePayload,
      };
    }

    return {
      ...context,
      ...responsePayload,
    };
  });

  // TODO success state
  return result;
};
