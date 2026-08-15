import { NodeType } from "@prisma/client";
import { manualTriggerExecutor } from "@/features/triggers/components/manual-trigger/executor";
import { YoutubeLiveChatExecutor } from "@/features/triggers/components/youtube-live-chat/executor";

import { DecisionExecutor } from "../components/decision/executor";
import { DiscordNotifyExecutor } from "../components/discord-notify/executor";
import { GamblingCheckerExecutor } from "../components/gambling-checker/executor";
import { GoogleSheetsExecutor } from "../components/google-sheets/executor";
import { httpRequestExecutor } from "../components/http-request/executor";
import { WaitDelayExecutor } from "../components/wait-delay/executor";
import { WebhookExecutor } from "../components/webhook/executor";
import { YoutubeDeleteExecutor } from "../components/youtube-delete/executor";
import { YouTubePinExecutor } from "../components/youtube-pin/executor";
// New Moderation Executors
import { YouTubeReplyExecutor } from "../components/youtube-reply/executor";
import { YouTubeTimeoutExecutor } from "../components/youtube-timeout/executor";
import type { NodeExecutor } from "../type";

// Cast all executors to generic NodeExecutor type
export const executorRegister: Partial<Record<NodeType, NodeExecutor>> = {
  // Existing executors
  [NodeType.MANUAL_TRIGGER]: manualTriggerExecutor,
  [NodeType.INTITAL]: manualTriggerExecutor,
  [NodeType.HTTP_REQUEST]: httpRequestExecutor,
  [NodeType.SLACK]: DiscordNotifyExecutor as NodeExecutor,
  [NodeType.YOUTUBE_LIVE_CHAT]: YoutubeLiveChatExecutor,
  [NodeType.DECISION]: DecisionExecutor as NodeExecutor,
  [NodeType.YOUTUBE_DELETE_CHAT]: YoutubeDeleteExecutor,
  [NodeType.GOOGLE_SHEETS]: GoogleSheetsExecutor as NodeExecutor,

  // New YouTube Moderation Actions
  [NodeType.YOUTUBE_REPLY]: YouTubeReplyExecutor as NodeExecutor,
  [NodeType.YOUTUBE_PIN]: YouTubePinExecutor as NodeExecutor,
  [NodeType.YOUTUBE_TIMEOUT]: YouTubeTimeoutExecutor as NodeExecutor,

  // Notification Nodes
  [NodeType.DISCORD_NOTIFY]: DiscordNotifyExecutor as NodeExecutor,

  // AI/Moderation Nodes
  [NodeType.GAMBLING_CHECKER]: GamblingCheckerExecutor as NodeExecutor,

  // Logic Nodes
  [NodeType.WAIT_DELAY]: WaitDelayExecutor as NodeExecutor,
  [NodeType.ROUTER]: WaitDelayExecutor as NodeExecutor,
  [NodeType.LOOP]: WaitDelayExecutor as NodeExecutor,

  // Integration Nodes
  [NodeType.WEBHOOK]: WebhookExecutor as NodeExecutor,
  [NodeType.EMAIL_NOTIFY]: WebhookExecutor as NodeExecutor,
};

export const getExecutor = (type: NodeType): NodeExecutor => {
  const executor = executorRegister[type];
  if (!executor) {
    throw new Error(`No executor found for node type: ${type}`);
  }
  return executor;
};
