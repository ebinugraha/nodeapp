import { inngest } from "@/inngest/client";
import { createId } from "@paralleldrive/cuid2";

export const sendWorkflowExecution = async (data: {
  workflowId: string;
  [key: string]: any;
}) => {
  const executionId = createId();
  return inngest.send({
    name: "workflows/execute.workflow",
    data: {
      ...data,
      executionId,
    },
    id: executionId,
  });
};
