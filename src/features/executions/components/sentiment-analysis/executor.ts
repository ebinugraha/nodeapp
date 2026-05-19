import { NodeExecutor } from "@/features/executions/type";
import { NonRetriableError } from "inngest";
import { NodeType } from "@/generated/prisma";
import { getExecutor } from "@/features/executions/lib/executor-register";

type SentimentData = {
  variableName?: string;
  minConfidence?: number;
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
}) => {
  return step.run("sentiment-analysis", async () => {
    const commentData = (context.YOUTUBE_VIDEO_COMMENT || context.YOUTUBE_LIVE_CHAT) as {
      text?: string;
      message?: string;
      author?: string;
    } | undefined;

    if (!commentData) {
      throw new NonRetriableError("No YouTube comment data in context");
    }

    const commentText = commentData.text || commentData.message || "";

    if (!commentText) {
      throw new NonRetriableError("No comment text to analyze");
    }

    // Use Gemini for sentiment analysis
    const geminiExecutor = getExecutor(NodeType.GEMINI);

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

    const aiResult = await geminiExecutor({
      data: {
        systemPrompt: "You are a sentiment analysis assistant. Analyze text and provide detailed emotional analysis.",
        userPrompt: sentimentPrompt,
        variableName: "temp_sentiment",
        temperature: 0.1,
      },
      context,
      nodeId: "sentiment-analysis",
      userId: "system",
      step,
    });

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
    const positiveKeywords = ["love", "great", "amazing", "awesome", "thank", "nice", "good", "best", "excellent", "wonderful"];
    const negativeKeywords = ["hate", "bad", "terrible", "awful", "worst", "stupid", "garbage", "trash"];

    const lowerComment = commentText.toLowerCase();
    const positiveCount = positiveKeywords.filter((word) => lowerComment.includes(word)).length;
    const negativeCount = negativeKeywords.filter((word) => lowerComment.includes(word)).length;

    if (positiveCount > negativeCount) {
      sentimentResult = {
        label: "positive",
        score: 0.5 + (positiveCount * 0.1),
        confidence: 0.7,
        emotions: { joy: 0.7, anger: 0, sadness: 0, surprise: 0.2 },
      };
    } else if (negativeCount > positiveCount) {
      sentimentResult = {
        label: "negative",
        score: -0.5 - (negativeCount * 0.1),
        confidence: 0.7,
        emotions: { joy: 0, anger: 0.6, sadness: 0.3, surprise: 0.1 },
      };
    }

    // Try to parse AI result
    try {
      const aiOutput = (aiResult as Record<string, unknown>)?.temp_sentiment as Record<string, unknown> | undefined;
      if (aiOutput && aiOutput.label) {
        sentimentResult = {
          label: aiOutput.label as "positive" | "negative" | "neutral",
          score: (aiOutput.score as number) || 0,
          confidence: (aiOutput.confidence as number) || 0.8,
          emotions: {
            joy: ((aiOutput.emotions as Record<string, number>)?.joy) || 0,
            anger: ((aiOutput.emotions as Record<string, number>)?.anger) || 0,
            sadness: ((aiOutput.emotions as Record<string, number>)?.sadness) || 0,
            surprise: ((aiOutput.emotions as Record<string, number>)?.surprise) || 0,
          },
        };
      }
    } catch {
      console.log("Sentiment AI parsing failed, using keyword analysis");
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
};