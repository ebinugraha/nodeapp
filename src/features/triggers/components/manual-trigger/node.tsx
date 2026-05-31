import type { NodeProps } from "@xyflow/react";
import { MousePointerIcon } from "lucide-react";
import { memo, useState } from "react";
import { useNodeStatus } from "@/features/executions/hooks/use-node-status";
import { manualTriggerChannel } from "@/inngest/channels/manual-trigger";
import { BaseTriggerNode } from "../base-trigger-node";
import { fetchManualTriggerToken } from "./actions";
import { ManualTriggerDialog } from "./dialog";

export const ManualTriggerNode = memo((props: NodeProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSetting = () => {
    setIsDialogOpen(true);
  };

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: manualTriggerChannel.name,
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
