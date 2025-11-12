import { NodeExecutor } from "@/features/executions/type";
import { googleFormTriggerChannel } from "@/inngest/channels/google-form-trigger";

type GoogleFormTriggerData = Record<string, unknown>;

export const GoogleFormTriggerExecutor: NodeExecutor<
  GoogleFormTriggerData
> = async ({ nodeId, context, step, publish }) => {
  await publish(
    googleFormTriggerChannel().status({
      nodeId,
      status: "loading",
    })
  );

  const result = await step.run("google-form-trigger", async () => context);

  await publish(
    googleFormTriggerChannel().status({
      nodeId,
      status: "success",
    })
  );

  return result;
};
