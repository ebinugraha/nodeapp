import { NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseTriggerNode } from "../base-trigger-node";
import { MousePointerIcon } from "lucide-react";
import { ManualTriggerDialog } from "./dialog";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { manualTriggerChannel } from "@/inngest/channels/manual-trigger";
import { fetchManualTriggerToken } from "./actions";

export const ManualTriggerNode = memo((props: NodeProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSetting = () => {
    setIsDialogOpen(true);
  };

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: manualTriggerChannel().name,
    topic: "status",
    refreshToken: fetchManualTriggerToken,
  });

  return (
    <>
      <ManualTriggerDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
      <BaseTriggerNode
        {...props}
        Icon={MousePointerIcon}
        status={nodeStatus}
        name="When clicking 'Execute workflow'"
        onSettings={handleSetting}
        onDoubleClick={handleSetting}
      />
    </>
  );
});

ManualTriggerNode.displayName = "ManualTriggerNode";
