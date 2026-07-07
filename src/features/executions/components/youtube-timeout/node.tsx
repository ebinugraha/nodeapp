"use client";

import { type Node, type NodeProps, useReactFlow } from "@xyflow/react";
import { Clock } from "lucide-react";
import { memo, useState } from "react";
import { fetchYoutubeTimeoutToken } from "@/features/executions/components/actions/moderation-actions";
import { BaseExecutionNode } from "@/features/executions/components/base-execution-node";
import { YouTubeTimeoutDialog } from "@/features/executions/components/youtube-timeout/dialog";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { youtubeTimeoutChannel } from "@/inngest/channels/moderation";

export const YouTubeTimeoutNode = memo(
  (props: NodeProps<Node<Record<string, unknown>>>) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const status = useNodeStatus({
      nodeId: props.id,
      channel: youtubeTimeoutChannel.name,
      topic: "status",
      refreshToken: fetchYoutubeTimeoutToken,
    });

    const handleSettings = () => setIsDialogOpen(true);

    const onSubmit = (values: Record<string, unknown>) => {
      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === props.id
            ? { ...node, data: { ...node.data, ...values } }
            : node,
        ),
      );
      setIsDialogOpen(false);
    };

    return (
      <>
        <YouTubeTimeoutDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSubmit={onSubmit}
          defaultValues={props.data}
          nodeId={props.id}
        />
        <BaseExecutionNode
          Icon={Clock}
          name="Timeout User"
          description="Temporarily timeout user"
          status={status}
          onSettings={handleSettings}
          onDoubleClick={handleSettings}
        />
      </>
    );
  },
);

YouTubeTimeoutNode.displayName = "YouTubeTimeoutNode";
