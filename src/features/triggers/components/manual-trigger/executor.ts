import { NodeExecutor } from "@/features/executions/type";

type ManualTriggerData = Record<string, unknown>;

export const manualTriggerExecutor: NodeExecutor<ManualTriggerData> = async ({
  nodeId,
  context,
  step,
}) => {
  // TODO loading state
  const result = await step.run("manual-trigger", async () => context);
  // TODO success state
  return result;
};
