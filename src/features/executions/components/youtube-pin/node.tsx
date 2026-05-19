"use client";

import { memo, useState } from "react";
import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { BaseExecutionNode } from "@/features/executions/components/base-execution-node";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { Pin } from "lucide-react";
import { PinDialog } from "@/features/executions/components/youtube-pin/dialog";
import { youtubePinChannel } from "@/inngest/channels/moderation";
import { fetchYoutubePinToken } from "@/features/executions/components/actions/moderation-actions";

export const YouTubePinNode = memo((props: NodeProps<Node<Record<string, unknown>>>) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const status = useNodeStatus({
    nodeId: props.id,
    channel: youtubePinChannel.name,
    topic: "status",
    refreshToken: fetchYoutubePinToken,
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
      <PinDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={onSubmit}
        defaultValues={props.data}
      />
      <BaseExecutionNode
        Icon={Pin}
        name="Pin Comment"
        description="Pin a comment"
        status={status}
        onSettings={handleSettings}
        onDoubleClick={handleSettings}
      />
    </>
  );
});

YouTubePinNode.displayName = "YouTubePinNode";
