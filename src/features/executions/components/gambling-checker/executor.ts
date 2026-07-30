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

    // 3. Second layer check with Llama 3.2 via Groq API
    if (process.env.GROQ_API_KEY) {
      try {
        const groqResponse = await ky
          .post("https://api.groq.com/openai/v1/chat/completions", {
            headers: {
              Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            },
            json: {
              model: "llama-3.2-3b-preview",
              messages: [
                {
                  role: "system",
                  content: "You are a gambling detection assistant. Analyze the user's text and determine if it contains promotions, discussions, or keywords related to online gambling (judi online). Return ONLY a JSON object in this exact format, with no extra text or markdown:\\n{\\n  \"gamblingResult\": {\\n    \"label\": \"JUDI ONLINE\" or \"NON JUDI\",\\n    \"confidence\": <number between 0 and 100>,\\n    \"isGambling\": <true or false>,\\n    \"prediction\": <1 for gambling, 0 for not gambling>,\\n    \"probabilities\": {\\n      \"non_judi\": <number between 0.0 and 1.0>,\\n      \"judi_online\": <number between 0.0 and 1.0>\\n    },\\n    \"processed_text\": \"<the analyzed text>\"\\n  }\\n}"
                },
                {
                  role: "user",
                  content: commentText
                }
              ],
              temperature: 0.1,
              response_format: { type: "json_object" }
            },
            timeout: 15000,
          })
          .json<any>();

        const groqContent = groqResponse.choices?.[0]?.message?.content;
        if (groqContent) {
          const parsed = JSON.parse(groqContent);
          if (parsed && parsed.gamblingResult) {
            result = {
              ...result,
              ...parsed.gamblingResult,
              original_text: commentText, // always keep original_text
            };
          }
        }
      } catch (error: any) {
        console.error("Groq Llama 3.2 Check error:", error);
      }
    }

    return {
      ...context,
      [data.variableName || "gamblingResult"]: {
        ...result,
        isGambling: Number(result?.prediction) === 1 || String(result?.label).toLowerCase().includes("judi_online") || String(result?.label).toUpperCase() === "JUDI ONLINE",
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
