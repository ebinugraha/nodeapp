"use client";

import { NodeProps, Position } from "@xyflow/react";
import { LucideIcon } from "lucide-react";
import { memo } from "react";
import Image from "next/image";
import { WorkflowNode } from "@/components/workflow-node";
import { BaseNode, BaseNodeContent } from "@/components/react-flow/base-node";
import { BaseHandle } from "@/components/react-flow/base-handle";

interface BaseExecutionNodeProps extends NodeProps {
  Icon: LucideIcon | string;
  name: string;
  description?: string;
  children?: React.ReactNode;
  // TODO next status
  // status?: NodeStatus;
  onSettings?: () => void;
  onDoubleClick?: () => void;
}

export const BaseExecutionNode = memo(
  ({
    id,
    Icon,
    name,
    description,
    children,
    onSettings,
    onDoubleClick,
  }: BaseExecutionNodeProps) => {
    // TODO add delete method
    const handleDelete = () => {};

    return (
      <WorkflowNode
        name={name}
        description={description}
        onDelete={handleDelete}
        onSettings={onSettings}
      >
        {/* TODO wrap a node status indicator */}
        <BaseNode onDoubleClick={onDoubleClick}>
          <BaseNodeContent>
            {typeof Icon === "string" ? (
              <Image src={Icon} alt={name} width={16} height={16} />
            ) : (
              <Icon className="size-4 text-muted-foreground" />
            )}
            {children}
            <BaseHandle id="target-1" type="target" position={Position.Left} />
            <BaseHandle id="source-1" type="source" position={Position.Right} />
          </BaseNodeContent>
        </BaseNode>
      </WorkflowNode>
    );
  }
);

BaseExecutionNode.displayName = "BaseExecutionNode";
