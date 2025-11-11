import { NodeExecutor } from "@/features/executions/type";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";
import Handlebars from "handlebars";

Handlebars.registerHelper("json", (context) => {
  const stringified = JSON.stringify(context, null, 2);
  return new Handlebars.SafeString(stringified);
});

type HTTPRequestData = {
  variableName: string;
  endPoint: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: string;
};

export const httpRequestExecutor: NodeExecutor<HTTPRequestData> = async ({
  data,
  nodeId,
  context,
  step,
}) => {
  // TODO loading state

  if (!data.endPoint) {
    throw new NonRetriableError("No endpoint provided for HTTP request");
  }

  if (!data.variableName) {
    throw new NonRetriableError("No variable name provided for HTTP request");
  }

  if (!data.method) {
    throw new NonRetriableError("No method provided for HTTP request");
  }

  const result = await step.run("http-request", async () => {
    const endpoint = Handlebars.compile(data.endPoint)(context);

    console.log("Making HTTP request to:", context);

    const method = data.method;

    const options: KyOptions = { method };

    if (["POST", "PUT", "PATCH"].includes(method)) {
      const resolved = Handlebars.compile(data.body)(context);
      JSON.parse(resolved); // validate JSON
      options.body = resolved;
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

    return {
      ...context,
      [data.variableName]: responsePayload,
    };
  });

  // TODO success state
  return result;
};
