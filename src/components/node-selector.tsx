"use client";

import {
  NodeType,
} from "@/generated/prisma";
import { createId } from "@paralleldrive/cuid2";
import {
  GlobeIcon,
  MousePointerIcon,
  SplitIcon,
  ShieldIcon,
  MessageSquareIcon,
  AlertTriangleIcon,
  ClockIcon,
  WebhookIcon,
  DatabaseIcon,
  FilterIcon,
  BrainIcon,
  SendIcon,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Separator } from "./ui/separator";
import { useReactFlow } from "@xyflow/react";
import { useCallback } from "react";
import { toast } from "sonner";

export type NodeTypeOption = {
  type: NodeType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }> | string;
  category?: "trigger" | "moderation" | "action" | "logic" | "ai" | "notification";
};

const triggerNodes: NodeTypeOption[] = [
  {
    type: NodeType.MANUAL_TRIGGER,
    label: "Trigger manually",
    description:
      "Runs the flow on clicking a button. Good for getting started quickly",
    icon: MousePointerIcon,
    category: "trigger",
  },
  {
    type: NodeType.YOUTUBE_LIVE_CHAT,
    label: "YouTube Live Chat",
    description: "Trigger workflow on new live chat messages",
    icon: "/logos/youtube.svg",
    category: "trigger",
  },
  {
    type: NodeType.YOUTUBE_VIDEO_COMMENT,
    label: "YouTube Video Comment",
    description: "Trigger workflow on new video comments",
    icon: "/logos/youtube.svg",
    category: "trigger",
  },
];

const moderationNodes: NodeTypeOption[] = [
  {
    type: NodeType.YOUTUBE_REPLY,
    label: "Reply to Comment",
    description: "Automatically reply to YouTube comments",
    icon: MessageSquareIcon,
    category: "moderation",
  },
  {
    type: NodeType.YOUTUBE_DELETE_CHAT,
    label: "Delete Comment",
    description: "Delete a message from YouTube live chat",
    icon: "/logos/youtube_delete.svg",
    category: "moderation",
  },
  {
    type: NodeType.YOUTUBE_HIDE,
    label: "Hide Comment",
    description: "Mark comment as spam or hide it",
    icon: ShieldIcon,
    category: "moderation",
  },
  {
    type: NodeType.YOUTUBE_FLAG,
    label: "Flag Comment",
    description: "Flag comment for YouTube review",
    icon: AlertTriangleIcon,
    category: "moderation",
  },
  {
    type: NodeType.YOUTUBE_TIMEOUT,
    label: "Timeout User",
    description: "Temporarily timeout a user in live chat",
    icon: ClockIcon,
    category: "moderation",
  },
  {
    type: NodeType.YOUTUBE_BAN,
    label: "Ban User",
    description: "Permanently ban a user from the channel",
    icon: ShieldIcon,
    category: "moderation",
  },
];

const aiNodes: NodeTypeOption[] = [
  {
    type: NodeType.AI_MODERATION,
    label: "AI Moderation",
    description: "Analyze comment with AI for moderation",
    icon: BrainIcon,
    category: "ai",
  },
  {
    type: NodeType.SENTIMENT_ANALYSIS,
    label: "Sentiment Analysis",
    description: "Analyze comment sentiment with AI",
    icon: BrainIcon,
    category: "ai",
  },
  {
    type: NodeType.SPAM_DETECTION,
    label: "Spam Detection",
    description: "Detect spam patterns in comments",
    icon: FilterIcon,
    category: "ai",
  },
  {
    type: NodeType.GEMINI,
    label: "Gemini",
    description: "Use Google Gemini to generate text",
    icon: "/logos/gemini.svg",
    category: "ai",
  },
];

const notificationNodes: NodeTypeOption[] = [
  {
    type: NodeType.DISCORD_NOTIFY,
    label: "Discord Notify",
    description: "Send notification to Discord channel",
    icon: SendIcon,
    category: "notification",
  },
  {
    type: NodeType.DISCORD,
    label: "Discord Message",
    description: "Send a message to Discord",
    icon: "/logos/discord.svg",
    category: "notification",
  },
];

const logicNodes: NodeTypeOption[] = [
  {
    type: NodeType.DECISION,
    label: "Decision",
    description: "Make a decision based on conditions",
    icon: SplitIcon,
    category: "logic",
  },
  {
    type: NodeType.FILTER,
    label: "Filter",
    description: "Filter comments based on conditions",
    icon: FilterIcon,
    category: "logic",
  },
  {
    type: NodeType.WAIT_DELAY,
    label: "Wait/Delay",
    description: "Add delay between actions",
    icon: ClockIcon,
    category: "logic",
  },
];

const actionNodes: NodeTypeOption[] = [
  {
    type: NodeType.HTTP_REQUEST,
    label: "HTTP Request",
    description: "Makes an HTTP request",
    icon: GlobeIcon,
    category: "action",
  },
  {
    type: NodeType.WEBHOOK,
    label: "Webhook",
    description: "Send data to external webhook",
    icon: WebhookIcon,
    category: "action",
  },
  {
    type: NodeType.GOOGLE_SHEETS,
    label: "Google Sheets",
    description: "Read or write data to spreadsheets",
    icon: "/logos/google-sheet.svg",
    category: "action",
  },
  {
    type: NodeType.STORE_DB,
    label: "Store to DB",
    description: "Store comment data to database",
    icon: DatabaseIcon,
    category: "action",
  },
];

interface NodeSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

// All trigger node types - used to enforce single trigger per workflow
const TRIGGER_NODE_TYPES: NodeType[] = [
  NodeType.MANUAL_TRIGGER,
  NodeType.YOUTUBE_LIVE_CHAT,
  NodeType.YOUTUBE_VIDEO_COMMENT,
];

export function NodeSelector({
  open,
  onOpenChange,
  children,
}: NodeSelectorProps) {
  const { setNodes, getNodes, screenToFlowPosition } = useReactFlow();

  // Check if any trigger node already exists in the workflow
  const hasTriggerNode = useCallback(() => {
    const nodes = getNodes();
    return nodes.some(
      (node) =>
        TRIGGER_NODE_TYPES.includes(node.type as NodeType) ||
        node.type === NodeType.INTITAL,
    );
  }, [getNodes]);

  const handleNodeSelect = useCallback(
    (selection: NodeTypeOption) => {
      // Validate: only one trigger node allowed per workflow
      if (selection.category === "trigger") {
        const nodes = getNodes();
        const existingTrigger = nodes.find(
          (node) =>
            TRIGGER_NODE_TYPES.includes(node.type as NodeType),
        );

        if (existingTrigger) {
          toast.error(
            "Only one trigger node is allowed per workflow. Remove the existing trigger first.",
          );
          return;
        }
      }

      setNodes((nodes) => {
        const hasInitialTrigger = nodes.some(
          (node) => node.type === NodeType.INTITAL,
        );

        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        const flowPosition = screenToFlowPosition({
          x: centerX + (Math.random() - 0.5) * 200,
          y: centerY + (Math.random() - 0.5) * 200,
        });

        const newNode = {
          id: createId(),
          data: {},
          position: flowPosition,
          type: selection.type,
        };

        if (hasInitialTrigger) {
          return [newNode];
        }

        return [...nodes, newNode];
      });

      onOpenChange(false);
    },
    [setNodes, getNodes, screenToFlowPosition, onOpenChange],
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Tambahkan Node</SheetTitle>
          <SheetDescription>
            Pilih node untuk menambahkan ke workflow
          </SheetDescription>
        </SheetHeader>

        {/* Triggers */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-muted-foreground mb-2 px-2">TRIGGERS</h3>
          {triggerNodes.map((nodeType) => (
            <NodeItem
              key={nodeType.type}
              nodeType={nodeType}
              onSelect={handleNodeSelect}
              disabled={hasTriggerNode()}
            />
          ))}
        </div>
        <Separator />

        {/* Moderation */}
        <div className="my-4">
          <h3 className="text-sm font-semibold text-muted-foreground mb-2 px-2">YOUTUBE MODERATION</h3>
          {moderationNodes.map((nodeType) => (
            <NodeItem key={nodeType.type} nodeType={nodeType} onSelect={handleNodeSelect} />
          ))}
        </div>
        <Separator />

        {/* AI */}
        <div className="my-4">
          <h3 className="text-sm font-semibold text-muted-foreground mb-2 px-2">AI & ANALYSIS</h3>
          {aiNodes.map((nodeType) => (
            <NodeItem key={nodeType.type} nodeType={nodeType} onSelect={handleNodeSelect} />
          ))}
        </div>
        <Separator />

        {/* Notification */}
        <div className="my-4">
          <h3 className="text-sm font-semibold text-muted-foreground mb-2 px-2">NOTIFICATIONS</h3>
          {notificationNodes.map((nodeType) => (
            <NodeItem key={nodeType.type} nodeType={nodeType} onSelect={handleNodeSelect} />
          ))}
        </div>
        <Separator />

        {/* Logic */}
        <div className="my-4">
          <h3 className="text-sm font-semibold text-muted-foreground mb-2 px-2">LOGIC</h3>
          {logicNodes.map((nodeType) => (
            <NodeItem key={nodeType.type} nodeType={nodeType} onSelect={handleNodeSelect} />
          ))}
        </div>
        <Separator />

        {/* Actions */}
        <div className="my-4">
          <h3 className="text-sm font-semibold text-muted-foreground mb-2 px-2">ACTIONS</h3>
          {actionNodes.map((nodeType) => (
            <NodeItem key={nodeType.type} nodeType={nodeType} onSelect={handleNodeSelect} />
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function NodeItem({
  nodeType,
  onSelect,
  disabled = false,
}: {
  nodeType: NodeTypeOption;
  onSelect: (selection: NodeTypeOption) => void;
  disabled?: boolean;
}) {
  const Icon = nodeType.icon;
  return (
    <div
      className={`w-full justify-start h-auto py-3 px-2 rounded-md border-l-2 border-transparent transition-colors ${
        disabled
          ? "opacity-50 cursor-not-allowed"
          : "cursor-pointer hover:border-l-primary hover:bg-accent"
      }`}
      onClick={() => {
        if (disabled) {
          toast.error("Only one trigger node is allowed per workflow.");
          return;
        }
        onSelect(nodeType);
      }}
    >
      <div className="flex items-center gap-3 w-full overflow-hidden">
        {typeof Icon === "string" ? (
          <img src={Icon} alt={nodeType.label} className="size-5 object-contain rounded-sm" />
        ) : (
          <Icon className="size-5" />
        )}
        <div className="flex flex-col items-start text-left min-w-0">
          <span className="text-sm font-medium truncate">{nodeType.label}</span>
          <span className="text-xs text-muted-foreground line-clamp-2">
            {disabled ? "Trigger already exists in workflow" : nodeType.description}
          </span>
        </div>
      </div>
    </div>
  );
}
