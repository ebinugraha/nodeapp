"use client";

import { memo, useState } from "react";
import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { BaseExecutionNode } from "@/features/executions/components/base-execution-node";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { ThumbsUp } from "lucide-react";
import { SentimentDialog } from "@/features/executions/components/sentiment-analysis/dialog";
import { sentimentAnalysisChannel } from "@/inngest/channels/moderation";
import { fetchSentimentToken } from "@/features/executions/components/actions/moderation-actions";

export const SentimentAnalysisNode = memo((props: NodeProps<Node<Record<string, unknown>>>) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const status = useNodeStatus({
    nodeId: props.id,
    channel: sentimentAnalysisChannel.name,
    topic: "status",
    refreshToken: fetchSentimentToken,
  });

  const handleSettings = () => setIsDialogOpen(true);

  const onSubmit = (values: Record<string, unknown>) => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === props.id ? { ...node, data: { ...node.data, ...values } } : node
      )
    );
    setIsDialogOpen(false);
  };

  return (
    <>
      <SentimentDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={onSubmit}
        defaultValues={props.data}
      />
      <BaseExecutionNode
        Icon={ThumbsUp}
        name="Sentiment Analysis"
        description="Analyze comment sentiment"
        status={status}
        onSettings={handleSettings}
        onDoubleClick={handleSettings}
      />
    </>
  );
});

SentimentAnalysisNode.displayName = "SentimentAnalysisNode";
