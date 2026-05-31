"use client";

import { type Node, type NodeProps, useReactFlow } from "@xyflow/react";
import { WebhookIcon } from "lucide-react";
import { memo, useState } from "react";
import { fetchWebhookToken } from "@/features/executions/components/actions/moderation-actions";
import { BaseExecutionNode } from "@/features/executions/components/base-execution-node";
import { WebhookDialog } from "@/features/executions/components/webhook/dialog";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { webhookChannel } from "@/inngest/channels/moderation";

export const WebhookNode = memo(
  (props: NodeProps<Node<Record<string, unknown>>>) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const status = useNodeStatus({
      nodeId: props.id,
      channel: webhookChannel.name,
      topic: "status",
      refreshToken: fetchWebhookToken,
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
        <WebhookDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSubmit={onSubmit}
          defaultValues={props.data}
        />
        <BaseExecutionNode
          Icon={WebhookIcon}
          name="Webhook"
          description="Send HTTP webhook"
          status={status}
          onSettings={handleSettings}
          onDoubleClick={handleSettings}
        />
      </>
    );
  },
);

WebhookNode.displayName = "WebhookNode";
