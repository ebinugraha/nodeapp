import Handlebars from "handlebars";
import type { NodeExecutor } from "@/features/executions/type";
import { waitDelayChannel } from "@/inngest/channels/moderation";

type WaitDelayData = {
  variableName?: string;
  mode?: "fixed" | "random";
  delayType?: "seconds" | "minutes" | "hours";

  // For Fixed Mode
  delaySeconds?: string | number;

  // For Random Mode
  minDelay?: string | number;
  maxDelay?: string | number;
};

export const WaitDelayExecutor: NodeExecutor<WaitDelayData> = async ({
  data,
  context,
  step,
  nodeId,
}) => {
  // Step 1: Calculate Delay
  const actualDelay = await step.run("wait-delay-calc", async () => {
    let delayInSeconds = 0;

    const parseDelay = (
      val: string | number | undefined,
      defaultVal: number,
    ) => {
      if (val === undefined || val === null) return defaultVal;
      if (typeof val === "number") return val;
      const compiled = Handlebars.compile(val.toString())(context);
      const parsed = parseFloat(compiled);
      return isNaN(parsed) ? defaultVal : parsed;
    };

    if (data.mode === "random") {
      const min = parseDelay(data.minDelay, 1);
      const max = parseDelay(data.maxDelay, 5);
      // Random number between min and max
      delayInSeconds = Math.floor(Math.random() * (max - min + 1)) + min;
    } else {
      delayInSeconds = parseDelay(data.delaySeconds, 5);
    }

    const multiplier = (() => {
      switch (data.delayType) {
        case "minutes":
          return 60;
        case "hours":
          return 3600;
        default:
          return 1;
      }
    })();

    const finalSeconds = delayInSeconds * multiplier;

    // Cap at 2 hours for safety
    const maxDelay = 7200;
    return Math.min(finalSeconds, maxDelay);
  });

  // Step 2: Publish Timer to UI
  const expiresAt = new Date(Date.now() + actualDelay * 1000).toISOString();
  await step.realtime.publish(
    `wait-${nodeId}-waiting`,
    waitDelayChannel.status,
    { nodeId, status: "loading" as any, expiresAt },
  );

  // Step 3: SLEEP (Must be outside step.run!)
  // If actualDelay is 0, we can skip sleep
  if (actualDelay > 0) {
    await step.sleep("wait-timer", `${actualDelay}s`);
  }

  // Step 4: Publish Success to UI
  await step.realtime.publish(
    `wait-${nodeId}-success`,
    waitDelayChannel.status,
    { nodeId, status: "success" },
  );

  return step.run("wait-delay-result", async () => {
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
