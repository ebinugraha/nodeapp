"use client";

import { type Node, type NodeProps, useReactFlow } from "@xyflow/react";
import { Clock } from "lucide-react";
import { memo, useState, useEffect } from "react";
import { fetchWaitDelayToken } from "@/features/executions/components/actions/moderation-actions";
import { BaseExecutionNode } from "@/features/executions/components/base-execution-node";
import { WaitDelayDialog } from "@/features/executions/components/wait-delay/dialog";
import { useNodeStatusData } from "@/features/executions/hooks/use-node-status";
import { waitDelayChannel } from "@/inngest/channels/moderation";

export const WaitDelayNode = memo(
  (props: NodeProps<Node<Record<string, unknown>>>) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const nodeState = useNodeStatusData({
      nodeId: props.id,
      channel: waitDelayChannel.name,
      topic: "status",
      refreshToken: fetchWaitDelayToken,
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

    const [timeLeft, setTimeLeft] = useState<string | null>(null);

    useEffect(() => {
      if (nodeState?.status === "loading" && nodeState.data?.expiresAt) {
        const expiresAt = new Date(nodeState.data.expiresAt as string).getTime();

        const updateTimer = () => {
          const now = Date.now();
          const diff = expiresAt - now;

          if (diff <= 0) {
            setTimeLeft("00:00");
            return;
          }

          const minutes = Math.floor(diff / 60000);
          const seconds = Math.floor((diff % 60000) / 1000);

          if (minutes >= 60) {
            const hours = Math.floor(minutes / 60);
            const remMins = minutes % 60;
            setTimeLeft(
              `${hours.toString().padStart(2, "0")}:${remMins
                .toString()
                .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
            );
          } else {
            setTimeLeft(
              `${minutes.toString().padStart(2, "0")}:${seconds
                .toString()
                .padStart(2, "0")}`,
            );
          }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
      } else {
        setTimeLeft(null);
      }
    }, [nodeState]);

    return (
      <>
        <WaitDelayDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSubmit={onSubmit}
          defaultValues={props.data}
          nodeId={props.id}
        />
        <BaseExecutionNode
          Icon={Clock}
          name="Wait/Delay"
          description="Add delay"
          status={nodeState.status}
          onSettings={handleSettings}
          onDoubleClick={handleSettings}
        >
          {timeLeft && (
            <div className="flex items-center justify-center gap-2 bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 px-2 py-1 rounded-md mt-1 mb-1">
              <Clock className="w-3 h-3 animate-pulse" />
              <span className="text-[11px] font-mono font-medium">
                {timeLeft}
              </span>
            </div>
          )}
        </BaseExecutionNode>
      </>
    );
  },
);

WaitDelayNode.displayName = "WaitDelayNode";
