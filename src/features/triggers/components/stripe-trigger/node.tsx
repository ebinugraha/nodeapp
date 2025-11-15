import { NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseTriggerNode } from "../base-trigger-node";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { googleFormTriggerChannel } from "@/inngest/channels/google-form-trigger";
import { fetcStripeTriggerToken } from "./actions";
import { StripeTriggerDialog } from "./dialog";
import { stripeTriggerChannel } from "@/inngest/channels/stripe-trigger";

export const StripeTriggerNode = memo((props: NodeProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSetting = () => {
    setIsDialogOpen(true);
  };

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: stripeTriggerChannel().name,
    topic: "status",
    refreshToken: fetcStripeTriggerToken,
  });

  return (
    <>
      <StripeTriggerDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
      <BaseTriggerNode
        {...props}
        Icon={"/logos/youtube.svg"}
        status={nodeStatus}
        name="Youtube live stream'"
        description="When stream is started"
        onSettings={handleSetting}
        onDoubleClick={handleSetting}
      />
    </>
  );
});

StripeTriggerNode.displayName = "StripeTriggerNode";
