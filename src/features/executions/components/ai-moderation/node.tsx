"use client";

import { memo, useState } from "react";
import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { BaseExecutionNode } from "@/features/executions/components/base-execution-node";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { Brain } from "lucide-react";
import { AIModerationDialog } from "@/features/executions/components/ai-moderation/dialog";
import { aiModerationChannel } from "@/inngest/channels/moderation";
import { fetchAIModerationToken } from "@/features/executions/components/actions/moderation-actions";

export const AIModerationNode = memo((props: NodeProps<Node<Record<string, unknown>>>) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const status = useNodeStatus({
    nodeId: props.id,
    channel: aiModerationChannel.name,
    topic: "status",
    refreshToken: fetchAIModerationToken,
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
      <AIModerationDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={onSubmit}
        defaultValues={props.data}
      />
      <BaseExecutionNode
        Icon={Brain}
        name="AI Moderation"
        description="Analyze comment with AI"
        status={status}
        onSettings={handleSettings}
        onDoubleClick={handleSettings}
      />
    </>
  );
});

AIModerationNode.displayName = "AIModerationNode";
