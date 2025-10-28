"use client";

import type { NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { PlaceholderNode } from "./react-flow/placeholder-node";
import { PlusIcon } from "lucide-react";
import { WorkflowNode } from "./workflow-node";
import { NodeSelector } from "./node-selector";

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
