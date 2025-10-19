import prisma from "@/lib/db";
import { inngest } from "./client";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("fetching-a-moment", "5s");
    await step.sleep("transcribing-a-moment", "5s");
    await step.sleep("sending to ai-a-moment", "5s");

    await step.run("create a workflow", async () => {
      return prisma.workflow.create({
        data: {
          name: "workflow from inngest",
        },
      });
    });
  }
);
