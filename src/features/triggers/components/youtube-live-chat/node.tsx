"use client";

import { NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseTriggerNode } from "../base-trigger-node";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { youtubeLiveChatChannel } from "@/inngest/channels/youtube-live-chat";
import { fetchYoutubeToken, toggleYoutubePolling } from "./actions"; // Import toggle
import { YoutubeLiveChatDialog, YoutubeLiveChatFormValues } from "./dialog";
import { Button } from "@/components/ui/button";
import { PlayIcon, PauseIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

// ... type definition sama ...
type YoutubeNodeData = YoutubeLiveChatFormValues & {
  isActive?: boolean;
};

export const YoutubeLiveChatNode = memo((props: NodeProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isToggling, setIsToggling] = useState(false); // State loading tombol
  const { setNodes } = useReactFlow();

  const data = props.data as YoutubeNodeData;
  const isActive = data.isActive || false;

  const handleSetting = () => {
    setIsDialogOpen(true);
  };

  const handleToggleActive = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!data.videoId) {
      toast.error("Please configure Video ID first");
      setIsDialogOpen(true);
      return;
    }

    try {
      setIsToggling(true);
      const newActiveState = !isActive;

      // 1. Panggil Server Action (Update DB & Trigger Inngest)
      await toggleYoutubePolling(
        props.id,
        newActiveState,
        data.videoId,
        data.pollingInterval,
        data.credentialId
      );

      // 2. Update UI Optimistic
      setNodes((nodes) =>
        nodes.map((node) => {
          if (node.id === props.id) {
            return {
              ...node,
              data: {
                ...node.data,
                isActive: newActiveState,
              },
            };
          }
          return node;
        })
      );

      toast.success(
        newActiveState ? "Polling started in background" : "Polling paused"
      );
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setIsToggling(false);
    }
  };

  // Tidak perlu useEffect setInterval lagi! Inngest yang handle loop.

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: youtubeLiveChatChannel().name,
    topic: "status",
    refreshToken: fetchYoutubeToken,
  });

  const handleSubmit = (values: YoutubeLiveChatFormValues) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === props.id) {
          return {
            ...node,
            data: { ...node.data, ...values },
          };
        }
        return node;
      })
    );
  };

  return (
    <>
      <YoutubeLiveChatDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={data}
      />
      <BaseTriggerNode
        {...props}
        Icon={"/logos/youtube.svg"}
        status={nodeStatus}
        name="YouTube Live Chat"
        description={
          data.videoId
            ? `ID: ${data.videoId} (${data.pollingInterval}s)`
            : "Not configured"
        }
        onSettings={handleSetting}
        onDoubleClick={handleSetting}
      >
        <div className="mt-2 flex w-full justify-center">
          <Button
            size="sm"
            variant={isActive ? "destructive" : "default"}
            className="w-full h-6 text-xs gap-2"
            onClick={handleToggleActive}
            disabled={isToggling}
          >
            {isToggling ? (
              <Loader2 className="size-3 animate-spin" />
            ) : isActive ? (
              <>
                <PauseIcon className="size-3" /> Pause
              </>
            ) : (
              <>
                <PlayIcon className="size-3" /> Continue
              </>
            )}
          </Button>
        </div>
      </BaseTriggerNode>
    </>
  );
});

YoutubeLiveChatNode.displayName = "YoutubeLiveChatNode";
