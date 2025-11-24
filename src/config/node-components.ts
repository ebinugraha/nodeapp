import { InitialNode } from "@/components/initial-node";
import { DecisionNode } from "@/features/executions/components/decision/node";
import { DiscordNode } from "@/features/executions/components/discord/node";
import { GeminitNode } from "@/features/executions/components/gemini/node";
import { HttpRequestNode } from "@/features/executions/components/http-request/node";
import { YoutubeDeleteNode } from "@/features/executions/components/youtube-delete/node";
import { GoogleFormTriggerNode } from "@/features/triggers/components/google-form-trigger/node";
import { ManualTriggerNode } from "@/features/triggers/components/manual-trigger/node";
import { StripeTriggerNode } from "@/features/triggers/components/stripe-trigger/node";
import { YoutubeLiveChatNode } from "@/features/triggers/components/youtube-live-chat/node";
import { NodeType } from "@/generated/prisma";
import { NodeTypes } from "@xyflow/react";

export const nodeComponents = {
  [NodeType.INTITAL]: InitialNode,
  [NodeType.HTTP_REQUEST]: HttpRequestNode,
  [NodeType.MANUAL_TRIGGER]: ManualTriggerNode,
  [NodeType.GOOGLE_FORM_TRIGGER]: GoogleFormTriggerNode,
  [NodeType.STRIPE_TRIGGER]: StripeTriggerNode,
  [NodeType.GEMINI]: GeminitNode,
  [NodeType.DISCORD]: DiscordNode,
  [NodeType.YOUTUBE_LIVE_CHAT]: YoutubeLiveChatNode,
  [NodeType.DECISION]: DecisionNode,
  [NodeType.YOUTUBE_DELETE_CHAT]: YoutubeDeleteNode,
} as const satisfies NodeTypes;

export type RegisteredNodeType = keyof typeof nodeComponents;
