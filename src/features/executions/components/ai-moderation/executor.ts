import { NodeExecutor } from "@/features/executions/type";
import { NonRetriableError } from "inngest";
import { NodeType } from "@/generated/prisma";
import { getExecutor } from "@/features/executions/lib/executor-register";

type AIModerationData = {
  variableName?: string;
  checkToxicity?: boolean;
  checkSpam?: boolean;
  checkProfanity?: boolean;
  toxicityThreshold?: number;
  spamThreshold?: number;
};

export const AIModerationExecutor: NodeExecutor<AIModerationData> = async ({
  data,
  context,
  step,
}) => {
  return step.run("ai-moderation-check", async () => {
    const commentData = (context.YOUTUBE_VIDEO_COMMENT || context.YOUTUBE_LIVE_CHAT) as {
      text?: string;
      message?: string;
      author?: string;
      commentId?: string;
      videoId?: string;
    } | undefined;

    if (!commentData) {
      throw new NonRetriableError("No YouTube comment data in context");
    }

    const commentText = commentData.text || commentData.message || "";

    if (!commentText) {
      throw new NonRetriableError("No comment text to analyze");
    }

    // Use Gemini for AI moderation
    const geminiExecutor = getExecutor(NodeType.GEMINI);

    const moderationPrompt = `Analyze this YouTube comment for moderation purposes. Respond ONLY with valid JSON:
{
  "toxicity_score": 0-1,
  "spam_score": 0-1,
  "profanity_detected": true/false,
  "contains_links": true/false,
  "repeated_characters": true/false,
  "is_bot_like": true/false,
  "recommendation": "approve" | "flag" | "hide",
  "reason": "brief explanation"
}

Comment to analyze: "${commentText}"`;

    const aiResult = await geminiExecutor({
      data: {
        systemPrompt: "You are a YouTube comment moderation assistant. Analyze comments and provide detailed moderation scores.",
        userPrompt: moderationPrompt,
        variableName: "temp_ai_moderation",
        temperature: 0.1,
      },
      context,
      nodeId: "ai-moderation",
      userId: "system",
      step,
    });

    // Parse AI result
    let moderationResult = {
      toxicity: 0,
      spam: 0,
      profanity: false,
      containsLinks: false,
      repeatedCharacters: false,
      isBotLike: false,
      recommendation: "approve" as "approve" | "flag" | "hide",
      reason: "No issues detected",
    };

    try {
      const aiOutput = (aiResult as Record<string, unknown>)?.temp_ai_moderation as string | undefined;
      if (aiOutput && typeof aiOutput === "string") {
        const parsed = JSON.parse(aiOutput);
        moderationResult = {
          toxicity: parsed.toxicity_score || 0,
          spam: parsed.spam_score || 0,
          profanity: parsed.profanity_detected || false,
          containsLinks: parsed.contains_links || false,
          repeatedCharacters: parsed.repeated_characters || false,
          isBotLike: parsed.is_bot_like || false,
          recommendation: parsed.recommendation || "approve",
          reason: parsed.reason || "Analyzed by AI",
        };
      }
    } catch {
      // Fallback to manual pattern matching
      console.log("AI parsing failed, using manual moderation");
    }

    // Manual pattern-based fallback checks
    const toxicityThreshold = data.toxicityThreshold || 0.7;
    const spamThreshold = data.spamThreshold || 0.6;

    // Check for links (potential spam)
    if (!moderationResult.containsLinks && /https?:\/\//i.test(commentText)) {
      moderationResult.containsLinks = true;
      moderationResult.spam = Math.max(moderationResult.spam, 0.6);
    }

    // Check for repeated characters (spam indicator)
    if (!moderationResult.repeatedCharacters && /(.)\1{4,}/.test(commentText)) {
      moderationResult.repeatedCharacters = true;
      moderationResult.spam = Math.max(moderationResult.spam, 0.7);
    }

    // Check for profanity (basic word list)
    const profanityList = ["badword1", "badword2"]; // Should be configurable
    if (!moderationResult.profanity) {
      const lowerComment = commentText.toLowerCase();
      moderationResult.profanity = profanityList.some((word) => lowerComment.includes(word));
      if (moderationResult.profanity) {
        moderationResult.toxicity = Math.max(moderationResult.toxicity, 0.8);
      }
    }

    // Update recommendation based on scores
    if (moderationResult.toxicity >= toxicityThreshold) {
      moderationResult.recommendation = "hide";
      moderationResult.reason = `Toxicity score: ${moderationResult.toxicity.toFixed(2)}`;
    } else if (moderationResult.spam >= spamThreshold) {
      moderationResult.recommendation = "flag";
      moderationResult.reason = `Spam score: ${moderationResult.spam.toFixed(2)}`;
    }

    return {
      ...context,
      [data.variableName || "moderationResult"]: {
        ...moderationResult,
        originalText: commentText,
        timestamp: new Date().toISOString(),
      },
    };
  });
};