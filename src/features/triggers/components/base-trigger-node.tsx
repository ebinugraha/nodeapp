"use client";

import { NodeProps, Position, useReactFlow } from "@xyflow/react";
import { LucideIcon } from "lucide-react";
import { memo } from "react";
import Image from "next/image";
import { WorkflowNode } from "@/components/workflow-node";
import { BaseNode, BaseNodeContent } from "@/components/react-flow/base-node";
import { BaseHandle } from "@/components/react-flow/base-handle";
import {
  NodeStatus,
  NodeStatusIndicator,
} from "@/components/react-flow/node-status-indicator";
import { cn } from "@/lib/utils";

type NodeCategory = "trigger" | "action" | "ai" | "logic" | "moderation" | "notification";

interface BaseTriggerNodeProps extends NodeProps {
  Icon: LucideIcon | string;
  name: string;
  description?: string;
  children?: React.ReactNode;
  status?: NodeStatus;
  onSettings?: () => void;
  onDoubleClick?: () => void;
  category?: NodeCategory;
}

// Category color configurations
const categoryConfig: Record<NodeCategory, {
  gradient: string;
  border: string;
  iconBg: string;
  iconColor: string;
}> = {
  trigger: {
    gradient: "from-amber-500/20 to-orange-500/10",
    border: "border-amber-500/40",
    iconBg: "bg-amber-500/20",
    iconColor: "text-amber-600",
  },
  action: {
    gradient: "from-slate-500/20 to-gray-500/10",
    border: "border-slate-500/40",
    iconBg: "bg-slate-500/20",
    iconColor: "text-slate-600",
  },
  ai: {
    gradient: "from-violet-500/20 to-purple-500/10",
    border: "border-violet-500/40",
    iconBg: "bg-violet-500/20",
    iconColor: "text-violet-600",
  },
  logic: {
    gradient: "from-emerald-500/20 to-teal-500/10",
    border: "border-emerald-500/40",
    iconBg: "bg-emerald-500/20",
    iconColor: "text-emerald-600",
  },
  moderation: {
    gradient: "from-red-500/20 to-pink-500/10",
    border: "border-red-500/40",
    iconBg: "bg-red-500/20",
    iconColor: "text-red-600",
  },
  notification: {
    gradient: "from-blue-500/20 to-cyan-500/10",
    border: "border-blue-500/40",
    iconBg: "bg-blue-500/20",
    iconColor: "text-blue-600",
  },
};

export const BaseTriggerNode = memo(
  ({
    id,
    Icon,
    name,
    status,
    description,
    children,
    onSettings,
    onDoubleClick,
    category = "trigger",
  }: BaseTriggerNodeProps) => {
    const { setNodes, setEdges } = useReactFlow();
    const config = categoryConfig[category];

    const handleDelete = () => {
      setNodes((currentNodes) => {
        const updatedNodes = currentNodes.filter((node) => node.id !== id);
        return updatedNodes;
      });

      setEdges((currentEdges) => {
        const updatedEdges = currentEdges.filter(
          (edge) => edge.source !== id && edge.target !== id,
        );
        return updatedEdges;
      });
    };

    return (
      <WorkflowNode
        name={name}
        description={description}
        onDelete={handleDelete}
        onSettings={onSettings}
        category={category}
      >
        <NodeStatusIndicator
          status={status}
          variant="badge"
        >
          <BaseNode
            onDoubleClick={onDoubleClick}
            className={cn(
              "rounded-xl min-w-[180px]",
              config.border,
              "bg-linear-to-br from-card to-card/80",
              "group-hover:shadow-lg group-hover:scale-[1.02]",
            )}
            status={status}
          >
            {/* Icon header */}
            <div className="flex items-center justify-center gap-3 p-4 border-b border-border/50 bg-linear-to-r from-transparent via-muted/30 to-transparent">
              <div className={cn(
                "flex items-center justify-center size-10 rounded-lg",
                config.iconBg
              )}>
                {typeof Icon === "string" ? (
                  <Image src={Icon} alt={name} width={20} height={20} className="object-contain" />
                ) : (
                  <Icon className={cn("size-5", config.iconColor)} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{name}</p>
                {description && (
                  <p className="text-xs text-muted-foreground truncate">{description}</p>
                )}
              </div>
            </div>

            {/* Content area */}
            <BaseNodeContent className="gap-y-2">
              {children}

              {/* Trigger indicator badge */}
              <div className="flex items-center justify-center gap-1.5 pt-2 border-t border-border/30">
                <div className={cn("size-1.5 rounded-full", config.iconColor.replace("text-", "bg-"))} />
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                  Trigger
                </span>
              </div>
            </BaseNodeContent>

            <BaseHandle
              id="source-1"
              type="source"
              position={Position.Right}
            />
          </BaseNode>
        </NodeStatusIndicator>
      </WorkflowNode>
    );
  },
);

BaseTriggerNode.displayName = "BaseTriggerNode";