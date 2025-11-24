"use client";

import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node";
import { YoutubeDeleteDialog, YoutubeDeleteFormValues } from "./dialog";
import { useNodeStatus } from "../../hooks/use-node-status";
import { youtubeDeleteChannel } from "@/inngest/channels/youtube-delete";
import { fetchYoutubeDeleteToken } from "./actions";

type YoutubeDeleteNodeData = YoutubeDeleteFormValues;
type YoutubeDeleteNodeType = Node<YoutubeDeleteNodeData>;

export const YoutubeDeleteNode = memo(
  (props: NodeProps<YoutubeDeleteNodeType>) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();

    // Reuse fetchYoutubeToken atau buat server action baru yang return token dari youtubeDeleteChannel
    const status = useNodeStatus({
      nodeId: props.id,
      channel: youtubeDeleteChannel().name,
      topic: "status",
      refreshToken: fetchYoutubeDeleteToken,
    });

    console.log(status, "<< Youtube Delete Node Status");

    const handleSettings = () => setIsDialogOpen(true);

    const onSubmit = (values: YoutubeDeleteFormValues) => {
      setNodes((nodes) =>
        nodes.map((node) => {
          if (node.id === props.id) {
            return { ...node, data: { ...node.data, ...values } };
          }
          return node;
        })
      );
    };

    return (
      <>
        <YoutubeDeleteDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSubmit={onSubmit}
          defaultValues={props.data}
        />
        <BaseExecutionNode
          {...props}
          Icon={"/logos/youtube_delete.svg"}
          status={status}
          name="Delete Chat"
          description="Remove message from stream"
          onSettings={handleSettings}
          onDoubleClick={handleSettings}
        />
      </>
    );
  }
);

YoutubeDeleteNode.displayName = "YoutubeDeleteNode";
