"use client";

import { type Node, type NodeProps, useReactFlow } from "@xyflow/react";
import { GlobeIcon } from "lucide-react";
import { memo, useState } from "react";
import { geminiExecutionChannel } from "@/inngest/channels/gemini";
import { httpRequestChannel } from "@/inngest/channels/http-request";
import { useNodeStatus } from "../../hooks/use-node-status";
import { BaseExecutionNode } from "../base-execution-node";
import { fetchGeminiToken } from "./actions";
import {
  AVAILABLE_MODELS,
  GeminiDialog,
  type GeminiFormValues,
} from "./dialog";

type GeminiNodeData = {
  variableName?: string;
  model?:
    | "gemini-2.0-flash"
    | "gemini-2.0-flash-8b"
    | "gemini-2.0-pro"
    | "gemini-pro"
    | undefined;
  systemPrompt?: string;
  userPrompt?: string;
};

type GeminiNodeyType = Node<GeminiNodeData>;

export const GeminitNode = memo((props: NodeProps<GeminiNodeyType>) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const handleSetting = () => {
    setIsDialogOpen(true);
  };

  const status = useNodeStatus({
    nodeId: props.id,
    channel: geminiExecutionChannel.name,
    topic: "status",
    refreshToken: fetchGeminiToken,
  });

  const nodeData = props.data;
  const description = nodeData?.userPrompt
    ? `${nodeData.model || AVAILABLE_MODELS[0]}`
    : "Not configured";

  const handleSubmit = (values: GeminiFormValues) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === props.id) {
          return {
            ...node,
            data: {
              ...node.data,
              ...values,
            },
          };
        }
        return node;
      }),
    );
  };

  return (
    <>
      <GeminiDialog
        onSubmit={handleSubmit}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        Icon={"/logos/gemini.svg"}
        status={status}
        name="Gemini"
        description={description}
        onSettings={handleSetting}
        onDoubleClick={handleSetting}
      />
    </>
  );
});

GeminitNode.displayName = "HttpRequetNode";
