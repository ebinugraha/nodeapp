import { Button } from "@/components/ui/button";
import { useExecuteWorkflow } from "@/features/workflows/hooks/use-workflows";
import { FlaskConicalIcon } from "lucide-react";

interface ExecutionButtonProps {
  workflowId: string;
}

export const ExecutionButton = ({ workflowId }: ExecutionButtonProps) => {
  const execute = useExecuteWorkflow();

  const handleExecute = () => {
    execute.mutate({ id: workflowId });
  };

  return (
    <Button onClick={handleExecute} disabled={execute.isPending}>
      <FlaskConicalIcon />
      Execute Workflow
    </Button>
  );
};
