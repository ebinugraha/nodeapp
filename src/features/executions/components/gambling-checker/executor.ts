import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import type { NodeExecutor } from "@/features/executions/type";
import { gamblingCheckerChannel } from "@/inngest/channels/moderation";
import ky from "ky";

type GamblingCheckerData = {
  textToCheck?: string;
  variableName?: string;
};

type GamblingResult = {
  prediction: number;
  label: string;
  confidence: number;
  probabilities: {
    non_judi: number;
    judi_online: number;
  };
  processed_text?: string;
  original_text: string;
};

export const GamblingCheckerExecutor: NodeExecutor<GamblingCheckerData> = async ({
  data,
  context,
  step,
  nodeId,
}) => {
  const publishError = async (
    suffix: string,
    error: { message: string; code?: string; field?: string },
  ) => {
    await step.realtime.publish(
      `gambling-${nodeId}-${suffix}`,
      gamblingCheckerChannel.status,
      { nodeId, status: "error", error },
    );
  };

  await step.realtime.publish(
    `gambling-${nodeId}-start`,
    gamblingCheckerChannel.status,
    { nodeId, status: "loading" },
  );

  if (!data.textToCheck) {
    const err = {
      message: "Text to check is missing in node configuration",
      code: "missing",
      field: "Text to check",
    };
    await publishError("error-missing-config", err);
    throw new NonRetriableError(err.message);
  }

  const commentText = Handlebars.compile(data.textToCheck)(context);

  if (!commentText || commentText.trim() === "") {
    const err = {
      message: "Compiled text to check is empty",
      code: "missing",
      field: "Text to check",
    };
    await publishError("error-empty-text", err);
    throw new NonRetriableError(err.message);
  }

  // HTTP POST using ky
  let result: GamblingResult | null = null;
  
  try {
    const response = await step.run(`${nodeId}-http-request`, async () => {
      const res = await ky.post("https://kobi17-cek-judol.hf.space/check", {
        json: { text: commentText },
        timeout: 15000,
      }).json<GamblingResult>();
      return res;
    });
    result = response;
  } catch (error: any) {
    console.error("Gambling Checker API error:", error);
    const err = {
      message: error.message || "Failed to call gambling checker API",
      code: "api_error",
    };
    await publishError("error-api", err);
    throw new NonRetriableError(err.message);
  }

  if (!result) {
    const err = {
      message: "API returned empty response",
      code: "empty_response",
    };
    await publishError("error-empty-response", err);
    throw new NonRetriableError(err.message);
  }

  await step.realtime.publish(
    `gambling-${nodeId}-success`,
    gamblingCheckerChannel.status,
    { nodeId, status: "success" },
  );

  return {
    ...context,
    [data.variableName || "gamblingResult"]: {
      ...result,
      isGambling: result.prediction === 1,
      timestamp: new Date().toISOString(),
    },
  };
};
