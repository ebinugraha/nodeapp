import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import {
  Editor,
  EditorError,
  EditorLoading,
} from "@/features/editor/components/editor";
import { EditorHeader } from "@/features/editor/components/editor-header";
import { prefetchWorkflow } from "@/features/workflows/server/prefetch";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ workflowId: string }>;
}

const WorkflowEditorLoader = async ({ workflowId }: { workflowId: string }) => {
  try {
    await prefetchWorkflow(workflowId);
  } catch (error) {
    redirect("/workflows");
  }

  return (
    <HydrateClient>
      <EditorHeader workflowId={workflowId} />
      <main className="flex-1">
        <Editor workflowId={workflowId} />
      </main>
    </HydrateClient>
  );
};

const Page = async ({ params }: PageProps) => {
  await requireAuth();
  const { workflowId } = await params;

  return (
    <ErrorBoundary fallback={<EditorError />}>
      <Suspense fallback={<EditorLoading />}>
        <WorkflowEditorLoader workflowId={workflowId} />
      </Suspense>
    </ErrorBoundary>
  );
};

export default Page;
