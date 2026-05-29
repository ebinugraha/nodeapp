"use client";

import { NodeProps, Position, useReactFlow } from "@xyflow/react";
import { LucideIcon } from "lucide-react";
import { memo } from "react";
import Image from "next/image";
import { WorkflowNode } from "@/components/workflow-node";
import { BaseNode, BaseNodeContent } from "@/components/react-flow/base-node";
import { BaseHandle } from "@/components/react-flow/base-handle";
import { NodeStatusIndicator } from "@/components/react-flow/node-status-indicator";
import { NodeErrorPanel } from "@/features/executions/components/node-error";
import { useNodeError } from "@/features/executions/hooks/use-node-error";
import {
  categoryConfig,
  type NodeCategory,
  type NodeStatus,
} from "@/types/node";
import { cn } from "@/lib/utils";

interface BaseTriggerNodeProps extends NodeProps {
  Icon: LucideIcon | string;
  name: string;
  description?: string;
  children?: React.ReactNode;
  status?: NodeStatus;
  onSettings?: () => void;
  onDoubleClick?: () => void;
  category?: NodeCategory;
  errorChannel?: string;
  errorTopic?: string;
  errorRefreshToken?: () => Promise<any>;
  onRetry?: () => void;
}

export const BaseTriggerNode = memo(
  ({
    id,
    Icon,
    name,
    status: propStatus,
    description,
    children,
    onSettings,
    onDoubleClick,
    category = "trigger",
    errorChannel,
    errorTopic,
    errorRefreshToken,
    onRetry,
  }: BaseTriggerNodeProps) => {
    const { setNodes, setEdges } = useReactFlow();
    const config = categoryConfig[category];

    const hasErrorTracking = !!(errorChannel && errorTopic && errorRefreshToken);

    const errorState = hasErrorTracking
      ? useNodeError({
          nodeId: id || "",
          channel: errorChannel,
          topic: errorTopic,
          refreshToken: errorRefreshToken,
        })
      : {
          error: null,
          clearError: () => {},
          status: "initial" as NodeStatus,
          hasError: false,
        };

    const { error: nodeError, clearError } = errorState;

    const status = nodeError ? "error" : propStatus;

    const handleDelete = () => {
      setNodes((currentNodes) => {
        return currentNodes.filter((node) => node.id !== id);
      });

      setEdges((currentEdges) => {
        return currentEdges.filter(
          (edge) => edge.source !== id && edge.target !== id,
        );
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
        <NodeStatusIndicator variant="badge" status={status}>
          <BaseNode
            onDoubleClick={onDoubleClick}
            className={cn(
              "rounded-xl min-w-[180px]",
              nodeError && "border-red-500/50 bg-linear-to-br from-red-50/50 to-card",
              !nodeError && config.border,
              "bg-linear-to-br from-card to-card/80",
              "group-hover:shadow-lg group-hover:scale-[1.02]",
              "transition-all duration-200",
            )}
          >
            {/* Icon header */}
            <div className="flex items-center justify-center gap-3 p-4 border-b border-border/50 bg-linear-to-r from-transparent via-muted/30 to-transparent">
              <div
                className={cn(
                  "flex items-center justify-center size-10 rounded-lg",
                  nodeError ? "bg-red-100" : config.iconBg,
                )}
              >
                {typeof Icon === "string" ? (
                  <Image
                    src={Icon}
                    alt={name}
                    width={20}
                    height={20}
                    className="object-contain"
                  />
                ) : (
                  <Icon
                    className={cn(
                      "size-5",
                      nodeError ? "text-red-600" : config.iconColor,
                    )}
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{name}</p>
                {description && (
                  <p className="text-xs text-muted-foreground truncate">
                    {description}
                  </p>
                )}
              </div>
            </div>

            {/* Content area */}
            <BaseNodeContent className="gap-y-2">
              {/* Error panel */}
              {nodeError && (
                <NodeErrorPanel
                  error={nodeError}
                  onDismiss={clearError}
                  onRetry={onRetry}
                />
              )}

              {/* Children content */}
              {!nodeError && children}

              {/* Trigger indicator badge */}
              <div className="flex items-center justify-center gap-1.5 pt-2 border-t border-border/30">
                <div
                  className={cn(
                    "size-1.5 rounded-full",
                    nodeError
                      ? "bg-red-500 animate-pulse"
                      : config.iconColor.replace("text-", "bg-"),
                  )}
                />
                <span
                  className={cn(
                    "text-[10px] uppercase tracking-wider font-medium",
                    nodeError ? "text-red-600" : "text-muted-foreground",
                  )}
                >
                  {nodeError ? "Failed" : "Trigger"}
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