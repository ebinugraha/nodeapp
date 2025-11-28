"use client";

import { NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseTriggerNode } from "../base-trigger-node";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { youtubeVideoCommentChannel } from "@/inngest/channels/youtube-video-comment";
import {
  fetchYoutubeVideoCommentToken,
  toggleYoutubeVideoPolling,
} from "./actions";
import {
  YoutubeVideoCommentDialog,
  YoutubeVideoCommentFormValues,
} from "./dialog";
import { Button } from "@/components/ui/button";
import { PlayIcon, PauseIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

type YoutubeVideoCommentData = YoutubeVideoCommentFormValues & {
  isActive?: boolean;
};

export const YoutubeVideoCommentNode = memo((props: NodeProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const { setNodes } = useReactFlow();

  const data = props.data as YoutubeVideoCommentData;
  const isActive = data.isActive || false;

  const handleSetting = () => setIsDialogOpen(true);

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
      await toggleYoutubeVideoPolling(
        props.id,
        newActiveState,
        data.videoId,
        data.pollingInterval
      );
      setNodes((nodes) =>
        nodes.map((node) => {
          if (node.id === props.id) {
            return {
              ...node,
              data: { ...node.data, isActive: newActiveState },
            };
          }
          return node;
        })
      );
      toast.success(newActiveState ? "Polling started" : "Polling paused");
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setIsToggling(false);
    }
  };

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: youtubeVideoCommentChannel().name,
    topic: "status",
    refreshToken: fetchYoutubeVideoCommentToken,
  });

  const handleSubmit = (values: YoutubeVideoCommentFormValues) => {
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
      <YoutubeVideoCommentDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={data}
      />
      <BaseTriggerNode
        {...props}
        Icon={"/logos/youtube.svg"} // Bisa pakai icon yang sama
        status={nodeStatus}
        name="Video Comment"
        description={data.videoId ? `ID: ${data.videoId}` : "Not configured"}
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
                {" "}
                <PauseIcon className="size-3" /> Pause{" "}
              </>
            ) : (
              <>
                {" "}
                <PlayIcon className="size-3" /> Start{" "}
              </>
            )}
          </Button>
        </div>
      </BaseTriggerNode>
    </>
  );
});

YoutubeVideoCommentNode.displayName = "YoutubeVideoCommentNode";
