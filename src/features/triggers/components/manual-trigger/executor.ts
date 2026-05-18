import { NodeExecutor } from "@/features/executions/type";
import { inngest } from "../../../../inngest/client";
import { manualTriggerChannel } from "../../../../inngest/channels/manual-trigger";

type ManualTriggerData = Record<string, unknown>;

export const manualTriggerExecutor: NodeExecutor<ManualTriggerData> = async ({
  nodeId,
  context,
  step,
}) => {
  await inngest.realtime.publish(manualTriggerChannel.status, {
    nodeId,
    status: "loading",
  });

  const result = await step.run("manual-trigger", async () => context);

  await inngest.realtime.publish(manualTriggerChannel.status, {
    nodeId,
    status: "success",
  });

  return result;
};
