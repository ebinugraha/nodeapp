import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import {
  CredentialsContainer,
  CredentialsList,
} from "@/features/credentials/components/credentials";
import { LoadingView, ErrorView } from "@/components/entity-components";
import { credentialsParamsLoader } from "@/features/credentials/server/params-loader";
import { prefetchCredentials } from "@/features/credentials/server/prefetch";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";

type Props = {
  searchParams: Promise<SearchParams>;
};

const CredentialsLoader = async ({ searchParams }: { searchParams: Promise<SearchParams> }) => {
  const params = await credentialsParamsLoader(searchParams);
  await prefetchCredentials(params);

  return (
    <HydrateClient>
      <CredentialsList />
    </HydrateClient>
  );
};

const Page = async ({ searchParams }: Props) => {
  await requireAuth();

  return (
    <CredentialsContainer>
      <ErrorBoundary fallback={<ErrorView message="Failed to load credentials" />}>
        <Suspense fallback={<LoadingView message="Loading credentials..." />}>
          <CredentialsLoader searchParams={searchParams} />
        </Suspense>
      </ErrorBoundary>
    </CredentialsContainer>
  );
};

export default Page;
