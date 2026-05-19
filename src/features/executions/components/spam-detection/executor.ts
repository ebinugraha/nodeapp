import { NodeExecutor } from "@/features/executions/type";
import { NonRetriableError } from "inngest";

type SpamDetectionData = {
  variableName?: string;
  checkLinks?: boolean;
  checkRepeatedChars?: boolean;
  checkCapsLock?: boolean;
  linkThreshold?: number;
  repeatedCharLimit?: number;
  capsLockThreshold?: number;
};

type SpamResult = {
  isSpam: boolean;
  scores: {
    links: number;
    repeatedChars: number;
    capsLock: number;
    overall: number;
  };
  reasons: string[];
};

type YouTubeCommentData = {
  text?: string;
  message?: string;
};

export const SpamDetectionExecutor: NodeExecutor<SpamDetectionData> = async ({
  data,
  context,
}) => {
  const commentData = (context.YOUTUBE_VIDEO_COMMENT || context.YOUTUBE_LIVE_CHAT) as YouTubeCommentData | undefined;

  if (!commentData) {
    throw new NonRetriableError("No YouTube comment data in context");
  }

  const commentText = commentData.text || commentData.message || "";
  const reasons: string[] = [];
  const scores = {
    links: 0,
    repeatedChars: 0,
    capsLock: 0,
    overall: 0,
  };

  // Check for links
  if (data.checkLinks !== false) {
    const linkCount = (commentText.match(/https?:\/\//gi) || []).length;
    const linkThreshold = data.linkThreshold || 1;
    if (linkCount >= linkThreshold) {
      scores.links = Math.min(linkCount * 0.3, 1);
      reasons.push(`${linkCount} link(s) detected`);
    }
  }

  // Check for repeated characters
  if (data.checkRepeatedChars !== false) {
    const repeatedCharPattern = /(.)\1{3,}/g;
    const matches = commentText.match(repeatedCharPattern);
    if (matches && matches.length > 0) {
      scores.repeatedChars = Math.min(matches.length * 0.2, 1);
      reasons.push(`Repeated characters detected (${matches.length} occurrences)`);
    }
  }

  // Check for excessive caps lock
  if (data.checkCapsLock !== false) {
    const capsCount = (commentText.match(/[A-Z]/g) || []).length;
    const totalChars = commentText.replace(/[^a-zA-Z]/g, "").length;
    const capsThreshold = data.capsLockThreshold || 0.7;
    if (totalChars > 0 && capsCount / totalChars > capsThreshold) {
      scores.capsLock = Math.min((capsCount / totalChars) * 0.5, 1);
      reasons.push(`Excessive caps lock (${Math.round((capsCount / totalChars) * 100)}%)`);
    }
  }

  // Calculate overall spam score
  scores.overall = Math.max(scores.links, scores.repeatedChars, scores.capsLock);
  const isSpam = scores.overall >= 0.5;

  return {
    ...context,
    [data.variableName || "spamResult"]: {
      isSpam,
      scores,
      reasons,
      timestamp: new Date().toISOString(),
    } as SpamResult,
  };
};