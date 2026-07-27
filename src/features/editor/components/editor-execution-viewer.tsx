import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { ExecutionLogViewer } from "@/features/executions/components/execution-log-viewer";
import { Loader2Icon, AlertCircleIcon, ActivityIcon } from "lucide-react";

interface EditorExecutionViewerProps {
  workflowId: string;
}

export const EditorExecutionViewer = ({ workflowId }: EditorExecutionViewerProps) => {
  const trpc = useTRPC();
  
  const { data: execution, isLoading, error } = useQuery({
    ...trpc.executions.getLatestByWorkflowId.queryOptions({ workflowId }),
    refetchInterval: 3000, // poll every 3s to show updates if running
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center size-full text-muted-foreground bg-card">
        <Loader2Icon className="size-5 animate-spin mb-2" />
        <p className="text-sm">Loading execution logs...</p>
      </div>
    );
  }

  if (error || !execution) {
    return (
      <div className="flex flex-col items-center justify-center size-full text-muted-foreground bg-card">
        <ActivityIcon className="size-8 mb-3 opacity-20" />
        <p className="text-sm font-medium">No execution logs found</p>
        <p className="text-xs opacity-70 mt-1">Run the workflow to see logs here.</p>
      </div>
    );
  }

  const output = execution.output as any;

  if (output?.logs) {
    return <ExecutionLogViewer logs={output.logs} />;
  }

  return (
    <div className="flex flex-col items-center justify-center size-full text-muted-foreground bg-card">
      <AlertCircleIcon className="size-5 mb-2 opacity-50" />
      <p className="text-sm">Legacy execution format not supported in this view.</p>
    </div>
  );
};
