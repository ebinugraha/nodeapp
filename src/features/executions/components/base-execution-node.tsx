"use client";

import { LucideIcon } from "lucide-react";
import { memo } from "react";
import { Position, useReactFlow } from "@xyflow/react";
import Image from "next/image";
import { WorkflowNode } from "@/components/workflow-node";
import { BaseNode, BaseNodeContent } from "@/components/react-flow/base-node";
import { BaseHandle } from "@/components/react-flow/base-handle";
import {
  NodeStatusIndicator,
} from "@/components/react-flow/node-status-indicator";
import { NodeErrorPanel } from "@/features/executions/components/node-error";
import { useNodeError } from "@/features/executions/hooks/use-node-error";
import {
  categoryConfig,
  type NodeCategory,
  type NodeStatus,
} from "@/types/node";
import { cn } from "@/lib/utils";

interface BaseExecutionNodeProps {
  Icon: LucideIcon | string;
  name: string;
  description?: string;
  children?: React.ReactNode;
  status?: NodeStatus;
  onSettings?: () => void;
  onDoubleClick?: () => void;
  id?: string;
  category?: NodeCategory;
  errorChannel?: string;
  errorTopic?: string;
  errorRefreshToken?: () => Promise<any>;
  onRetry?: () => void;
}

export const BaseExecutionNode = memo(
  ({
    id,
    Icon,
    name,
    description,
    status: propStatus,
    children,
    onSettings,
    onDoubleClick,
    category = "action",
    errorChannel,
    errorTopic,
    errorRefreshToken,
    onRetry,
  }: BaseExecutionNodeProps) => {
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
        <NodeStatusIndicator status={status} variant="badge">
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
            {/* Category label */}
            <div className="relative">
              <div className="absolute -top-3 left-3 z-10">
                <span
                  className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider",
                    nodeError
                      ? "bg-red-500/20 text-red-700"
                      : config.iconBg,
                    !nodeError && config.iconColor,
                  )}
                >
                  {nodeError ? "Error" : config.label}
                </span>
              </div>

              {/* Header */}
              <div className="flex items-center gap-3 p-4 pt-5 border-b border-border/50 bg-linear-to-r from-transparent via-muted/30 to-transparent">
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
            </div>

            {/* Content */}
            <BaseNodeContent className="gap-y-3">
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

              {/* Category indicator */}
              <div className="flex items-center justify-center gap-1.5 pt-2 border-t border-border/30">
                <div
                  className={cn(
                    "size-1.5 rounded-full",
                    nodeError
                      ? "bg-red-500 animate-pulse"
                      : config.iconColor.replace("text-", "bg-"),
                  )}
                />
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                  {nodeError ? "Failed" : config.label}
                </span>
              </div>
            </BaseNodeContent>

            {/* Handles */}
            <BaseHandle id="target-1" type="target" position={Position.Left} />
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

BaseExecutionNode.displayName = "BaseExecutionNode";
