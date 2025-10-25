"use client";

import { ErrorView, LoadingView } from "@/components/entity-components";
import { useSuspenseWorkflow } from "@/features/workflows/hooks/use-workflows";

export const EditorLoading = () => {
  return <LoadingView message="Loading editor..." />;
};

export const EditorError = () => {
  return <ErrorView message="Editor error..." />;
};

export const Editor = ({ workflowId }: { workflowId: string }) => {
  const { data: wofkflow } = useSuspenseWorkflow(workflowId);

  return <p>{JSON.stringify(wofkflow)}</p>;
};
