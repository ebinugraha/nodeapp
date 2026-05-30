import { NodeType } from "@prisma/client";
import { NodeExecutor } from "../type";
import { manualTriggerExecutor } from "@/features/triggers/components/manual-trigger/executor";
import { httpRequestExecutor } from "../components/http-request/executor";
import { GeminiExecutor } from "../components/gemini/executor";
import { DiscordExecutor } from "../components/discord/executor";
import { YoutubeLiveChatExecutor } from "@/features/triggers/components/youtube-live-chat/executor";
import { DecisionExecutor } from "../components/decision/executor";
import { YoutubeDeleteExecutor } from "../components/youtube-delete/executor";
import { YoutubeVideoCommentExecutor } from "@/features/triggers/components/youtube-video-comment/executor";
import { GoogleSheetsExecutor } from "../components/google-sheets/executor";

// New Moderation Executors
import { YouTubeReplyExecutor } from "../components/youtube-reply/executor";
import { YouTubeHideExecutor } from "../components/youtube-hide/executor";
import { YouTubePinExecutor } from "../components/youtube-pin/executor";
import { YouTubeTimeoutExecutor } from "../components/youtube-timeout/executor";
import { DiscordNotifyExecutor } from "../components/discord-notify/executor";
import { AIModerationExecutor } from "../components/ai-moderation/executor";
import { SentimentAnalysisExecutor } from "../components/sentiment-analysis/executor";
import { SpamDetectionExecutor } from "../components/spam-detection/executor";
import { FilterConditionExecutor } from "../components/filter/executor";
import { WaitDelayExecutor } from "../components/wait-delay/executor";
import { WebhookExecutor } from "../components/webhook/executor";
import { StoreDBExecutor } from "../components/store-db/executor";

// Cast all executors to generic NodeExecutor type
export const executorRegister: Record<NodeType, NodeExecutor> = {
  // Existing executors
  [NodeType.MANUAL_TRIGGER]: manualTriggerExecutor,
  [NodeType.INTITAL]: manualTriggerExecutor,
  [NodeType.HTTP_REQUEST]: httpRequestExecutor,
  [NodeType.GEMINI]: GeminiExecutor as NodeExecutor,
  [NodeType.ANTHROPIC]: GeminiExecutor as NodeExecutor,
  [NodeType.DEEPSEEK]: GeminiExecutor as NodeExecutor,
  [NodeType.OPENAI]: GeminiExecutor as NodeExecutor,
  [NodeType.DISCORD]: DiscordExecutor as NodeExecutor,
  [NodeType.SLACK]: DiscordExecutor as NodeExecutor,
  [NodeType.YOUTUBE_LIVE_CHAT]: YoutubeLiveChatExecutor,
  [NodeType.DECISION]: DecisionExecutor as NodeExecutor,
  [NodeType.YOUTUBE_DELETE_CHAT]: YoutubeDeleteExecutor,
  [NodeType.YOUTUBE_VIDEO_COMMENT]: YoutubeVideoCommentExecutor,
  [NodeType.GOOGLE_SHEETS]: GoogleSheetsExecutor as NodeExecutor,

  // New YouTube Moderation Actions
  [NodeType.YOUTUBE_REPLY]: YouTubeReplyExecutor as NodeExecutor,
  [NodeType.YOUTUBE_HIDE]: YouTubeHideExecutor as NodeExecutor,
  [NodeType.YOUTUBE_PIN]: YouTubePinExecutor as NodeExecutor,
  [NodeType.YOUTUBE_TIMEOUT]: YouTubeTimeoutExecutor as NodeExecutor,

  // Notification Nodes
  [NodeType.DISCORD_NOTIFY]: DiscordNotifyExecutor as NodeExecutor,
  [NodeType.SLACK_NOTIFY]: DiscordNotifyExecutor as NodeExecutor,

  // AI/Moderation Nodes
  [NodeType.AI_MODERATION]: AIModerationExecutor as NodeExecutor,
  [NodeType.SENTIMENT_ANALYSIS]: SentimentAnalysisExecutor as NodeExecutor,
  [NodeType.SPAM_DETECTION]: SpamDetectionExecutor as NodeExecutor,

  // Logic Nodes
  [NodeType.FILTER]: FilterConditionExecutor as NodeExecutor,
  [NodeType.WAIT_DELAY]: WaitDelayExecutor as NodeExecutor,
  [NodeType.ROUTER]: FilterConditionExecutor as NodeExecutor,
  [NodeType.LOOP]: FilterConditionExecutor as NodeExecutor,

  // Integration Nodes
  [NodeType.WEBHOOK]: WebhookExecutor as NodeExecutor,
  [NodeType.STORE_DB]: StoreDBExecutor as NodeExecutor,
  [NodeType.EMAIL_NOTIFY]: WebhookExecutor as NodeExecutor,
};

export const getExecutor = (type: NodeType): NodeExecutor => {
  const executor = executorRegister[type];
  if (!executor) {
    throw new Error(`No executor found for node type: ${type}`);
  }
  return executor;
};