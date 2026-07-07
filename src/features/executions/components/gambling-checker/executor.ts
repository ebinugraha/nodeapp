import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import ky from "ky";
import type { NodeExecutor } from "@/features/executions/type";
import { gamblingCheckerChannel } from "@/inngest/channels/moderation";

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

export const GamblingCheckerExecutor: NodeExecutor<
  GamblingCheckerData
> = async ({ data, context, step, nodeId }) => {
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

  // 1. Compile template
  const prepareResult = await step.run(`${nodeId}-prepare`, async () => {
    const commentText = Handlebars.compile(data.textToCheck)(context);

    if (!commentText || commentText.trim() === "") {
      return {
        error: "Compiled text to check is empty",
        code: "missing",
        field: "Text to check",
      };
    }
    return { commentText, error: null };
  });

  if (prepareResult.error) {
    await publishError("error-prepare", {
      message: prepareResult.error,
      code: prepareResult.code,
      field: prepareResult.field,
    });
    throw new NonRetriableError(prepareResult.error);
  }

  const { commentText } = prepareResult as { commentText: string };

  // 2. Call custom HuggingFace model
  const finalResult = await step.run(`${nodeId}-http-request`, async () => {
    let result: GamblingResult | null = null;

    try {
      result = await ky
        .post("https://kobi17-cek-judol.hf.space/check", {
          json: { text: commentText },
          timeout: 15000,
        })
        .json<GamblingResult>();
    } catch (error: any) {
      console.error("Gambling Checker API error:", error);
    }

    if (!result) {
      // Ultimate fallback using simple keywords if API fails
      const lowerComment = commentText.toLowerCase();
      const isGamblingMatch = lowerComment.match(/(slot|gacor|maxwin|depo|zeus|judi|sbobet)/i);

      result = {
        prediction: isGamblingMatch ? 1 : 0,
        label: isGamblingMatch ? "judi_online" : "non_judi",
        confidence: 0.8,
        probabilities: {
          non_judi: isGamblingMatch ? 0.2 : 0.8,
          judi_online: isGamblingMatch ? 0.8 : 0.2,
        },
        original_text: commentText,
      };
    }

    return {
      ...context,
      [data.variableName || "gamblingResult"]: {
        ...result,
        isGambling: Number(result.prediction) === 1 || String(result.label).toLowerCase().includes("judi_online"),
        timestamp: new Date().toISOString(),
      },
    };
  });

  await step.realtime.publish(
    `gambling-${nodeId}-success`,
    gamblingCheckerChannel.status,
    { nodeId, status: "success" },
  );

  return finalResult;
};
