import { NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseTriggerNode } from "../base-trigger-node";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { googleFormTriggerChannel } from "@/inngest/channels/google-form-trigger";
import { fetchGoogleFormTriggerToken } from "./actions";
import { GoogleFormTriggerDialog } from "./dialog";

export const GoogleFormTriggerNode = memo((props: NodeProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSetting = () => {
    setIsDialogOpen(true);
  };

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: googleFormTriggerChannel().name,
    topic: "status",
    refreshToken: fetchGoogleFormTriggerToken,
  });

  return (
    <>
      <GoogleFormTriggerDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
      <BaseTriggerNode
        {...props}
        Icon={"/logos/googleform.svg"}
        status={nodeStatus}
        name="Google Form'"
        description="when form is submitted"
        onSettings={handleSetting}
        onDoubleClick={handleSetting}
      />
    </>
  );
});

GoogleFormTriggerNode.displayName = "GoogleFormTriggerNode";
