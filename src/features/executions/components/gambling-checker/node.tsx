"use client";

import { type Node, type NodeProps, useReactFlow } from "@xyflow/react";
import { Dice5 } from "lucide-react";
import { memo, useState } from "react";
import { fetchGamblingToken } from "@/features/executions/components/actions/moderation-actions";
import { BaseExecutionNode } from "@/features/executions/components/base-execution-node";
import { GamblingCheckerDialog } from "@/features/executions/components/gambling-checker/dialog";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { gamblingCheckerChannel } from "@/inngest/channels/moderation";

export const GamblingCheckerNode = memo(
  (props: NodeProps<Node<Record<string, unknown>>>) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const status = useNodeStatus({
      nodeId: props.id,
      channel: gamblingCheckerChannel.name,
      topic: "status",
      refreshToken: fetchGamblingToken,
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
        <GamblingCheckerDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSubmit={onSubmit}
          defaultValues={props.data}
          nodeId={props.id}
        />
        <BaseExecutionNode
          Icon={Dice5}
          name="Gambling Checker"
          description="Detect online gambling content"
          status={status}
          onSettings={handleSettings}
          onDoubleClick={handleSettings}
        />
      </>
    );
  },
);

GamblingCheckerNode.displayName = "GamblingCheckerNode";
