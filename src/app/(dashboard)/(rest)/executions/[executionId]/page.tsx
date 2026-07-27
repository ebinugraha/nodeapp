import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ExecutionView } from "@/features/executions/components/execution";
import {
  ExecutionsError,
} from "@/features/executions/components/executions";
import { DetailLoadingView } from "@/components/entity-components";
import { prefetchExecution } from "@/features/executions/server/prefetch";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";

interface PageProps {
  params: Promise<{ executionId: string }>;
}

const ExecutionLoader = async ({ executionId }: { executionId: string }) => {
  await prefetchExecution(executionId);

  return (
    <HydrateClient>
      <ExecutionView executionId={executionId} />
    </HydrateClient>
  );
};

const Page = async ({ params }: PageProps) => {
  await requireAuth();
  const { executionId } = await params;

  return (
    <div className="p-4 md:px-10 md:py-6 h-full">
      <div className="mx-auto max-w-screen-md w-full flex flex-col gap-y-8 h-full">
        <ErrorBoundary fallback={<ExecutionsError />}>
          <Suspense fallback={<DetailLoadingView message="Loading execution details..." />}>
            <ExecutionLoader executionId={executionId} />
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default Page;
