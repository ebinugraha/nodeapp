import { NodeType } from "@prisma/client";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import type { NodeExecutor } from "@/features/executions/type";
import { sentimentAnalysisChannel } from "@/inngest/channels/moderation";
import ky from "ky";

type SentimentData = {
  variableName?: string;
  minConfidence?: number;
  textToAnalyze?: string;
  credentialId?: string;
};

type SentimentResult = {
  label: "positive" | "negative" | "neutral";
  score: number;
  confidence: number;
  emotions: {
    joy: number;
    anger: number;
    sadness: number;
    surprise: number;
  };
};

export const SentimentAnalysisExecutor: NodeExecutor<SentimentData> = async ({
  data,
  context,
  step,
  nodeId,
  userId,
}) => {
  const publishError = async (
    suffix: string,
    error: { message: string; code?: string; field?: string },
  ) => {
    await step.realtime.publish(
      `sentiment-${nodeId}-${suffix}`,
      sentimentAnalysisChannel.status,
      { nodeId, status: "error", error },
    );
  };

  await step.realtime.publish(
    `sentiment-${nodeId}-loading`,
    sentimentAnalysisChannel.status,
    { nodeId, status: "loading" },
  );

  // 1. Prepare data
  const prepareResult = await step.run(`${nodeId}-prepare`, async () => {
    if (!data.textToAnalyze) {
      return {
        error: "Text to analyze is missing in node configuration",
        code: "missing",
        field: "Text to analyze",
      };
    }

    const commentText = Handlebars.compile(data.textToAnalyze)(context);

    if (!commentText || commentText.trim() === "") {
      return {
        error: "Compiled text to analyze is empty",
        code: "missing",
        field: "Text to analyze",
      };
    }

    const sentimentPrompt = `Analyze the sentiment of this YouTube comment. Response ONLY with valid JSON:
{
  "label": "positive" | "negative" | "neutral",
  "score": -1 to 1,
  "confidence": 0 to 1,
  "emotions": {
    "joy": 0 to 1,
    "anger": 0 to 1,
    "sadness": 0 to 1,
    "surprise": 0 to 1
  }
}

Comment to analyze: "${commentText}"`;

    return { commentText, sentimentPrompt, error: null };
  });

  if (prepareResult.error) {
    await publishError("error-prepare", {
      message: prepareResult.error,
      code: prepareResult.code,
      field: prepareResult.field,
    });
    throw new NonRetriableError(prepareResult.error);
  }

  const { commentText, sentimentPrompt } = prepareResult as {
    commentText: string;
    sentimentPrompt: string;
  };

  // 2. Call Groq
  let aiResult: any = null;

  try {
    const groqApiKey = process.env.GROQ_API_KEY;
    
    if (!groqApiKey) {
      throw new Error("GROQ_API_KEY is missing in environment variables");
    }

    const response: any = await step.run(`${nodeId}-groq`, async () => {
      const res = await ky.post("https://api.groq.com/openai/v1/chat/completions", {
        headers: {
          Authorization: `Bearer ${groqApiKey}`,
        },
        json: {
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: "You are an AI assistant that analyzes sentiment of Indonesian YouTube comments. Reply ONLY with valid JSON.",
            },
            {
              role: "user",
              content: sentimentPrompt,
            },
          ],
          response_format: { type: "json_object" },
          temperature: 0.1,
        },
        timeout: 20000,
      }).json();
      return res;
    });

    aiResult = {
      temp_sentiment: {
        text: response.choices[0].message.content,
      }
    };
  } catch (err: any) {
    console.error("Groq sentiment analysis failed:", err);
  }

  // 3. Parse result and fallback
  const finalResult = await step.run(`${nodeId}-parse`, async () => {
    // Default sentiment result
    let sentimentResult: SentimentResult = {
      label: "neutral",
      score: 0,
      confidence: 0,
      emotions: {
        joy: 0,
        anger: 0,
        sadness: 0,
        surprise: 0,
      },
    };

    // Simple keyword-based fallback
    const positiveKeywords = [
      "love",
      "great",
      "amazing",
      "awesome",
      "thank",
      "nice",
      "good",
      "best",
      "excellent",
      "wonderful",
    ];
    const negativeKeywords = [
      "hate",
      "bad",
      "terrible",
      "awful",
      "worst",
      "stupid",
      "garbage",
      "trash",
    ];

    const lowerComment = commentText.toLowerCase();
    const positiveCount = positiveKeywords.filter((word) =>
      lowerComment.includes(word),
    ).length;
    const negativeCount = negativeKeywords.filter((word) =>
      lowerComment.includes(word),
    ).length;

    if (positiveCount > negativeCount) {
      sentimentResult = {
        label: "positive",
        score: 0.5 + positiveCount * 0.1,
        confidence: 0.7,
        emotions: { joy: 0.7, anger: 0, sadness: 0, surprise: 0.2 },
      };
    } else if (negativeCount > positiveCount) {
      sentimentResult = {
        label: "negative",
        score: -0.5 - negativeCount * 0.1,
        confidence: 0.7,
        emotions: { joy: 0, anger: 0.6, sadness: 0.3, surprise: 0.1 },
      };
    }

    // Try to parse AI result
    if (aiResult && aiResult.temp_sentiment?.text) {
      try {
        const cleanText = aiResult.temp_sentiment.text
          .replace(/```json\n?|\n?```/g, "")
          .trim();
        const aiOutput = JSON.parse(cleanText);

        if (aiOutput && aiOutput.label) {
          sentimentResult = {
            label: aiOutput.label as "positive" | "negative" | "neutral",
            score: (aiOutput.score as number) || 0,
            confidence: (aiOutput.confidence as number) || 0.8,
            emotions: {
              joy: (aiOutput.emotions?.joy as number) || 0,
              anger: (aiOutput.emotions?.anger as number) || 0,
              sadness: (aiOutput.emotions?.sadness as number) || 0,
              surprise: (aiOutput.emotions?.surprise as number) || 0,
            },
          };
        }
      } catch (e) {
        console.log("Sentiment AI parsing failed, using keyword analysis", e);
      }
    }

    return {
      ...context,
      [data.variableName || "sentimentResult"]: {
        ...sentimentResult,
        originalText: commentText,
        timestamp: new Date().toISOString(),
      },
    };
  });

  await step.realtime.publish(
    `sentiment-${nodeId}-success`,
    sentimentAnalysisChannel.status,
    { nodeId, status: "success" },
  );

  return finalResult;
};
