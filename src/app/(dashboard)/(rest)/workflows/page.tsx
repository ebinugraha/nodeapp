import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import {
  WorkflowsContainer,
  WorkflowsError,
  WorkflowsList,
  WorkflowsLoading,
} from "@/features/workflows/components/workflows";
import { workflowsParamsLoader } from "@/features/workflows/server/params-loader";
import { prefetchWorkflows } from "@/features/workflows/server/prefetch";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";

type Props = {
  searchParams: Promise<SearchParams>;
};

const WorkflowsLoader = async ({ searchParams }: { searchParams: Promise<SearchParams> }) => {
  const params = await workflowsParamsLoader(searchParams);
  await prefetchWorkflows(params);
  
  return (
    <HydrateClient>
      <WorkflowsList />
    </HydrateClient>
  );
};

const Page = async ({ searchParams }: Props) => {
  await requireAuth();

  return (
    <WorkflowsContainer>
      <ErrorBoundary fallback={<WorkflowsError />}>
        <Suspense fallback={<WorkflowsLoading />}>
          <WorkflowsLoader searchParams={searchParams} />
        </Suspense>
      </ErrorBoundary>
    </WorkflowsContainer>
  );
};

export default Page;
