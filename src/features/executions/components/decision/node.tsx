"use client";

import { Node, NodeProps, Position, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node"; //
import { BaseHandle } from "@/components/react-flow/base-handle"; //
import { GitForkIcon } from "lucide-react";
import { DecisionDialog, DecisionFormValues } from "./dialog"; // (Kita buat di langkah 4)

// Kita memodifikasi BaseExecutionNode sedikit atau membuat custom render
// karena BaseExecutionNode di project Anda hanya punya 1 output handle fix.
// Untuk Decision, kita butuh custom handle.

type DecisionNodeData = {
  variableName?: string;
  variable?: string;
  operator?: "equals" | "contains" | "not_contains";
  value?: string;
};

type DecisionNodeType = Node<DecisionNodeData>;

export const DecisionNode = memo((props: NodeProps<DecisionNodeType>) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // Data settings bisa disimpan di sini atau hook status
  const { setNodes } = useReactFlow();

  const nodeData = props.data as any;
  const description = nodeData.variable
    ? `${nodeData.operator} "${nodeData.value}"`
    : "Condition not set";

  const onSubmit = (values: DecisionFormValues) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === props.id) {
          return {
            ...node,
            data: {
              variableName: values.variableName,
              variable: values.variable,
              operator: values.operator,
              value: values.value,
            },
          };
        }
        return node;
      })
    );
  };

  return (
    <>
      <DecisionDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={(values) => {
          onSubmit(values);
          setIsDialogOpen(false);
        }}
        defaultValues={nodeData}
      />

      <div className="relative rounded-md border-[0.5px] bg-card text-card-foreground border-black min-w-[120px]">
        {/* Input Handle (Kiri) */}
        <BaseHandle type="target" position={Position.Left} id="main" />

        <div
          className="p-3 border-b flex items-center gap-2"
          onDoubleClick={() => setIsDialogOpen(true)}
        >
          <GitForkIcon className="size-4" />
          <div className="flex flex-col">
            <span className="font-medium text-sm">Condition</span>
            <span className="text-[10px] text-muted-foreground">
              {description}
            </span>
          </div>
        </div>

        {/* Output Handles (Kanan) */}
        <div className="flex flex-col gap-2 py-2">
          <div className="relative flex items-center justify-end">
            <span className="text-xs mr-2 text-green-600 font-medium">
              True
            </span>
            <BaseHandle
              type="source"
              position={Position.Right}
              id="true" // ID ini penting untuk engine
              className="bg-green-500 border-green-600 !top-1/2"
            />
          </div>
          <div className="relative flex items-center justify-end">
            <span className="text-xs mr-2 text-red-600 font-medium">False</span>
            <BaseHandle
              type="source"
              position={Position.Right}
              id="false" // ID ini penting untuk engine
              className="bg-red-500 border-red-600 !top-1/2"
            />
          </div>
        </div>
      </div>
    </>
  );
});
