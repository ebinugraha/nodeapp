"use client";

import type { NodeProps } from "@xyflow/react";
import { PlusIcon } from "lucide-react";
import { memo, useState } from "react";
import { NodeSelector } from "./node-selector";
import { PlaceholderNode } from "./react-flow/placeholder-node";
import { WorkflowNode } from "./workflow-node";

export const InitialNode = memo((props: NodeProps) => {
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  return (
    <NodeSelector open={isSelectorOpen} onOpenChange={setIsSelectorOpen}>
      <WorkflowNode name="Initial node" description="Click to add a node">
        <PlaceholderNode {...props} onClick={() => setIsSelectorOpen(true)}>
          <div className="cursor-pointer flex items-center justify-center">
            <PlusIcon className="size-4" />
          </div>
        </PlaceholderNode>
      </WorkflowNode>
    </NodeSelector>
  );
});
