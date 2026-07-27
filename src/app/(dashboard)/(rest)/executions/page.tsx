import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import {
  ExecutionsContainer,
  ExecutionsError,
  ExecutionsList,
  ExecutionslsLoading,
} from "@/features/executions/components/executions";
import { executionsParamsLoader } from "@/features/executions/server/params-loader";
import { prefetchExecutions } from "@/features/executions/server/prefetch";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient, prefetch } from "@/trpc/server";

type Props = {
  searchParams: Promise<SearchParams>;
};

const ExecutionsLoader = async ({ searchParams }: { searchParams: Promise<SearchParams> }) => {
  const params = await executionsParamsLoader(searchParams);
  await prefetchExecutions(params);
  
  return (
    <HydrateClient>
      <ExecutionsList />
    </HydrateClient>
  );
};

const Page = async ({ searchParams }: Props) => {
  await requireAuth();

  return (
    <ExecutionsContainer>
      <ErrorBoundary fallback={<ExecutionsError />}>
        <Suspense fallback={<ExecutionslsLoading />}>
          <ExecutionsLoader searchParams={searchParams} />
        </Suspense>
      </ErrorBoundary>
    </ExecutionsContainer>
  );
};

export default Page;
