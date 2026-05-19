"use client";

import { memo, useState } from "react";
import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { BaseExecutionNode } from "@/features/executions/components/base-execution-node";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { Ban } from "lucide-react";
import { YouTubeBanDialog } from "@/features/executions/components/youtube-ban/dialog";
import { youtubeBanChannel } from "@/inngest/channels/moderation";
import { fetchYoutubeBanToken } from "@/features/executions/components/actions/moderation-actions";

export const YouTubeBanNode = memo((props: NodeProps<Node<Record<string, unknown>>>) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const status = useNodeStatus({
    nodeId: props.id,
    channel: youtubeBanChannel.name,
    topic: "status",
    refreshToken: fetchYoutubeBanToken,
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
      <YouTubeBanDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={onSubmit}
        defaultValues={props.data}
      />
      <BaseExecutionNode
        Icon={Ban}
        name="Ban User"
        description="Permanently ban user"
        status={status}
        onSettings={handleSettings}
        onDoubleClick={handleSettings}
      />
    </>
  );
});

YouTubeBanNode.displayName = "YouTubeBanNode";
