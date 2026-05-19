"use client";

import { memo, useState } from "react";
import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { BaseExecutionNode } from "@/features/executions/components/base-execution-node";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { AlertTriangle } from "lucide-react";
import { SpamDetectionDialog } from "@/features/executions/components/spam-detection/dialog";
import { spamDetectionChannel } from "@/inngest/channels/moderation";
import { fetchSpamToken } from "@/features/executions/components/actions/moderation-actions";

export const SpamDetectionNode = memo((props: NodeProps<Node<Record<string, unknown>>>) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const status = useNodeStatus({
    nodeId: props.id,
    channel: spamDetectionChannel.name,
    topic: "status",
    refreshToken: fetchSpamToken,
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
      <SpamDetectionDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={onSubmit}
        defaultValues={props.data}
      />
      <BaseExecutionNode
        Icon={AlertTriangle}
        name="Spam Detection"
        description="Detect spam patterns"
        status={status}
        onSettings={handleSettings}
        onDoubleClick={handleSettings}
      />
    </>
  );
});

SpamDetectionNode.displayName = "SpamDetectionNode";
