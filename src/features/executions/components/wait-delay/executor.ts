import { NodeExecutor } from "@/features/executions/type";

type WaitDelayData = {
  variableName?: string;
  delaySeconds?: number;
  delayType?: "seconds" | "minutes" | "hours";
};

export const WaitDelayExecutor: NodeExecutor<WaitDelayData> = async ({
  data,
  context,
  step,
}) => {
  return step.run("wait-delay", async () => {
    const delaySeconds = (() => {
      switch (data.delayType) {
        case "minutes":
          return (data.delaySeconds || 1) * 60;
        case "hours":
          return (data.delaySeconds || 1) * 3600;
        default:
          return data.delaySeconds || 5;
      }
    })();

    // Cap at 1 hour for safety
    const maxDelay = 3600;
    const actualDelay = Math.min(delaySeconds, maxDelay);

    console.log(`[WaitDelay] Waiting for ${actualDelay} seconds...`);

    await step.sleep("wait-timer", actualDelay * 1000);

    return {
      ...context,
      [data.variableName || "delayResult"]: {
        completed: true,
        delaySeconds: actualDelay,
        timestamp: new Date().toISOString(),
      },
    };
  });
};