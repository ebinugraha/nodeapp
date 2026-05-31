"use client";

import { type Node, type NodeProps, useReactFlow } from "@xyflow/react";
import { MessageSquare } from "lucide-react";
import { memo, useState } from "react";
import { fetchYoutubeReplyToken } from "@/features/executions/components/actions/moderation-actions";
import { BaseExecutionNode } from "@/features/executions/components/base-execution-node";
import { YouTubeReplyDialog } from "@/features/executions/components/youtube-reply/dialog";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { youtubeReplyChannel } from "@/inngest/channels/moderation";

export const YouTubeReplyNode = memo(
  (props: NodeProps<Node<Record<string, unknown>>>) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const status = useNodeStatus({
      nodeId: props.id,
      channel: youtubeReplyChannel.name,
      topic: "status",
      refreshToken: fetchYoutubeReplyToken,
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
        <YouTubeReplyDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSubmit={onSubmit}
          defaultValues={props.data}
        />
        <BaseExecutionNode
          Icon={MessageSquare}
          name="Reply to Comment"
          description="Automatically reply to YouTube comments"
          status={status}
          onSettings={handleSettings}
          onDoubleClick={handleSettings}
        />
      </>
    );
  },
);

YouTubeReplyNode.displayName = "YouTubeReplyNode";
