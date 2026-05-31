"use client";

import { type Node, type NodeProps, useReactFlow } from "@xyflow/react";
import { Send } from "lucide-react";
import { memo, useState } from "react";
import { fetchDiscordNotifyToken } from "@/features/executions/components/actions/moderation-actions";
import { BaseExecutionNode } from "@/features/executions/components/base-execution-node";
import { DiscordNotifyDialog } from "@/features/executions/components/discord-notify/dialog";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { discordNotifyChannel } from "@/inngest/channels/moderation";

export const DiscordNotifyNode = memo(
  (props: NodeProps<Node<Record<string, unknown>>>) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const status = useNodeStatus({
      nodeId: props.id,
      channel: discordNotifyChannel.name,
      topic: "status",
      refreshToken: fetchDiscordNotifyToken,
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
        <DiscordNotifyDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSubmit={onSubmit}
          defaultValues={props.data}
        />
        <BaseExecutionNode
          Icon={Send}
          name="Discord Notify"
          description="Send notification to Discord"
          status={status}
          onSettings={handleSettings}
          onDoubleClick={handleSettings}
        />
      </>
    );
  },
);

DiscordNotifyNode.displayName = "DiscordNotifyNode";
