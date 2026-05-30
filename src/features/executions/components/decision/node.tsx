"use client";

import { Node, NodeProps, Position, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node"; //
import { BaseHandle } from "@/components/react-flow/base-handle"; //
import { GitForkIcon } from "lucide-react";
import { DecisionDialog, DecisionFormValues } from "./dialog"; // (Kita buat di langkah 4)
import { WorkflowNode } from "@/components/workflow-node";
import { cn } from "@/lib/utils";

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
      }),
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

      <WorkflowNode
        name="Decision"
        description={description}
        onDelete={() => {
          setNodes((nodes) => nodes.filter((n) => n.id !== props.id));
        }}
        onSettings={() => setIsDialogOpen(true)}
        category="logic"
      >
        <div className={cn(
            "relative rounded-xl border border-border/70 bg-card text-card-foreground shadow-sm",
            "hover:border-primary/40 hover:shadow-md",
            "transition-all duration-200 cursor-pointer overflow-hidden min-w-[140px] max-w-[200px]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2",
        )} onDoubleClick={() => setIsDialogOpen(true)}>
          <div className="absolute inset-0 rounded-xl shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          
          <div className="relative flex items-center gap-2 px-2 py-1.5 border-b border-border bg-card rounded-t-xl overflow-hidden">
            
            <div className="flex items-center justify-center size-6 rounded-md shrink-0 bg-purple-100 dark:bg-purple-500/20">
              <GitForkIcon className="size-3.5 text-purple-600 dark:text-purple-400" />
            </div>
            
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <p className="text-[11px] font-semibold truncate leading-none">Decision</p>
              <p className="text-[10px] text-muted-foreground truncate mt-1 leading-none">
                {description}
              </p>
            </div>
          </div>

          <BaseHandle type="target" position={Position.Left} id="main" />

          {/* Output Handles (Kanan) */}
          <div className="flex flex-col gap-1.5 py-2 px-1">
            <div className="relative flex items-center justify-end">
              <span className="text-[9px] mr-3 text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider">
                True
              </span>
              <BaseHandle
                type="source"
                position={Position.Right}
                id="true"
                className="bg-emerald-500 border-emerald-600 dark:bg-emerald-500/20 dark:border-emerald-500 !top-1/2"
              />
            </div>
            <div className="relative flex items-center justify-end">
              <span className="text-[9px] mr-3 text-red-600 dark:text-red-400 font-semibold uppercase tracking-wider">False</span>
              <BaseHandle
                type="source"
                position={Position.Right}
                id="false"
                className="bg-red-500 border-red-600 dark:bg-red-500/20 dark:border-red-500 !top-1/2"
              />
            </div>
          </div>
        </div>
      </WorkflowNode>
    </>
  );
});
