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
              "rounded-xl min-w-[140px] max-w-[200px]",
              nodeError && "border-red-500/50 bg-linear-to-br from-red-50/50 to-card",
              !nodeError && config.border,
              "bg-linear-to-br from-card to-card/80",
              "transition-all duration-200",
            )}
          >
            {/* Icon header */}
            <div className={cn(
              "relative flex items-center gap-2 px-2 py-1.5 bg-card rounded-t-xl overflow-hidden",
              (children || description || nodeError) && "border-b border-border"
            )}>
              {/* Left Accent Bar */}
              <div className={cn(
                "absolute left-0 top-0 bottom-0 w-1",
                nodeError ? "bg-red-500" : config.iconColor.replace("text-", "bg-")
              )} />
              
              <div
                className={cn(
                  "flex items-center justify-center size-6 rounded-md shrink-0 ml-1",
                  nodeError ? "bg-red-500/10" : config.iconBg,
                )}
              >
                {typeof Icon === "string" ? (
                  <Image
                    src={Icon}
                    alt={name}
                    width={14}
                    height={14}
                    className="object-contain"
                  />
                ) : (
                  <Icon
                    className={cn(
                      "size-3.5",
                      nodeError ? "text-red-600" : config.iconColor,
                    )}
                  />
                )}
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex items-center gap-1.5">
                  <p className="text-[11px] font-semibold truncate leading-none">{name}</p>
                  {nodeError && (
                    <span className="text-[8px] font-bold uppercase tracking-wider text-red-500 bg-red-500/10 px-1 py-0.5 rounded-sm">
                      Error
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Content area */}
            {(children || description || nodeError) && (
              <BaseNodeContent className="gap-y-2 pb-2.5 px-2 pt-2">
                {/* Error panel */}
                {nodeError && (
                  <NodeErrorPanel
                    error={nodeError}
                    onDismiss={clearError}
                    onRetry={onRetry}
                  />
                )}

                {/* Configuration / Description */}
                {!nodeError && description && !children && (
                  <div className="text-[10px] text-muted-foreground bg-muted/20 px-2 py-1.5 rounded-md border border-border/50 truncate">
                    {description}
                  </div>
                )}

                {/* Children content */}
                {!nodeError && children}
              </BaseNodeContent>
            )}

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