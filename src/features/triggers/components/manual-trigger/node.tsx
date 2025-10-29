import { NodeProps } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseTriggerNode } from "../base-trigger-node";
import { MousePointerIcon } from "lucide-react";
import { ManualTriggerDialog } from "./dialog";

export const ManualTriggerNode = memo((props: NodeProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSetting = () => {
    setIsDialogOpen(true);
  };

  const status = "loading";

  return (
    <>
      <ManualTriggerDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
      <BaseTriggerNode
        {...props}
        Icon={MousePointerIcon}
        status={status}
        name="When clicking 'Execute workflow'"
        onSettings={handleSetting}
        onDoubleClick={handleSetting}
      />
    </>
  );
});

ManualTriggerNode.displayName = "ManualTriggerNode";
