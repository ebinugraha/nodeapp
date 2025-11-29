"use client";

import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node";
import { DiscordFormValues, DiscordDialog } from "./dialog";
import { useNodeStatus } from "../../hooks/use-node-status";
import { geminiExecutionChannel } from "@/inngest/channels/gemini";
import { fetchDiscordToken } from "./actions";
import { discordExecutionChannel } from "@/inngest/channels/discord";

type DiscordNodeData = {
  webhookUrl?: string;
  content?: string;
  username?: string;
};

type DiscordNodeType = Node<DiscordNodeData>;

export const DiscordNode = memo((props: NodeProps<DiscordNodeType>) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const handleSetting = () => {
    setIsDialogOpen(true);
  };

  const status = useNodeStatus({
    nodeId: props.id,
    channel: discordExecutionChannel().name,
    topic: "status",
    refreshToken: fetchDiscordToken,
  });

  const nodeData = props.data;
  const description = nodeData?.content
    ? `Send: ${nodeData.content.slice(0, 50)}...`
    : "Not configured";

  const handleSubmit = (values: DiscordFormValues) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === props.id) {
          return {
            ...node,
            data: {
              ...node.data,
              ...values,
            },
          };
        }
        return node;
      })
    );
  };

  return (
    <>
      <DiscordDialog
        nodeId={props.id}
        onSubmit={handleSubmit}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        Icon={"/logos/discord.svg"}
        status={status}
        name="Discord"
        description={description}
        onSettings={handleSetting}
        onDoubleClick={handleSetting}
      />
    </>
  );
});

DiscordNode.displayName = "HttpRequetNode";
