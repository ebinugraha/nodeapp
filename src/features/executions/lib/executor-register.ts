import { NodeType } from "@/generated/prisma";
import { NodeExecutor } from "../type";
import { manualTriggerExecutor } from "@/features/triggers/components/manual-trigger/executor";
import { httpRequestExecutor } from "../components/http-request/executor";
import { GoogleFormTriggerExecutor } from "@/features/triggers/components/google-form-trigger/executor";
import { GeminiExecutor } from "../components/gemini/executor";
import { DiscordExecutor } from "../components/discord/executor";
import { YoutubeLiveChatExecutor } from "@/features/triggers/components/youtube-live-chat/executor";

export const excetorRegister: Record<NodeType, NodeExecutor> = {
  [NodeType.MANUAL_TRIGGER]: manualTriggerExecutor,
  [NodeType.INTITAL]: manualTriggerExecutor,
  [NodeType.HTTP_REQUEST]: httpRequestExecutor,
  [NodeType.GOOGLE_FORM_TRIGGER]: GoogleFormTriggerExecutor,
  [NodeType.GEMINI]: GeminiExecutor,
  [NodeType.ANTHROPIC]: GeminiExecutor,
  [NodeType.DEEPSEEK]: GeminiExecutor,
  [NodeType.OPENAI]: GeminiExecutor,
  [NodeType.STRIPE_TRIGGER]: GeminiExecutor,
  [NodeType.DISCORD]: DiscordExecutor,
  [NodeType.SLACK]: DiscordExecutor,
  [NodeType.YOUTUBE_LIVE_CHAT]: YoutubeLiveChatExecutor,
};

export const getExecutor = (type: NodeType): NodeExecutor => {
  const executor = excetorRegister[type];
  if (!executor) {
    throw new Error(`No executor found for node type: ${type}`);
  }
  return executor;
};
