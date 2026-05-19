"use client";

import { memo, useState } from "react";
import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { BaseExecutionNode } from "@/features/executions/components/base-execution-node";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { ShieldAlert } from "lucide-react";
import { YouTubeFlagDialog } from "@/features/executions/components/youtube-flag/dialog";
import { youtubeFlagChannel } from "@/inngest/channels/moderation";
import { fetchYoutubeFlagToken } from "@/features/executions/components/actions/moderation-actions";

export const YouTubeFlagNode = memo((props: NodeProps<Node<Record<string, unknown>>>) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const status = useNodeStatus({
    nodeId: props.id,
    channel: youtubeFlagChannel.name,
    topic: "status",
    refreshToken: fetchYoutubeFlagToken,
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
      <YouTubeFlagDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={onSubmit}
        defaultValues={props.data}
      />
      <BaseExecutionNode
        Icon={ShieldAlert}
        name="Flag Comment"
        description="Flag comment for review"
        status={status}
        onSettings={handleSettings}
        onDoubleClick={handleSettings}
      />
    </>
  );
});

YouTubeFlagNode.displayName = "YouTubeFlagNode";
