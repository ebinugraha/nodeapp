import { ErrorBoundary } from "@sentry/nextjs";
import { Suspense } from "react";
import { CredentialView } from "@/features/credentials/components/credential";
import { DetailLoadingView, ErrorView } from "@/components/entity-components";
import { prefetchCredential } from "@/features/credentials/server/prefetch";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";

interface PageProps {
  params: Promise<{ credentialId: string }>;
}

const CredentialLoader = async ({ credentialId }: { credentialId: string }) => {
  await prefetchCredential(credentialId);

  return (
    <HydrateClient>
      <CredentialView credentialId={credentialId} />
    </HydrateClient>
  );
};

const Page = async ({ params }: PageProps) => {
  await requireAuth();
  const { credentialId } = await params;

  return (
    <div className="p-4 h-full">
      <div className="w-full flex flex-col gap-y-8 h-full">
        <ErrorBoundary fallback={<ErrorView message="Failed to load credential" />}>
          <Suspense fallback={<DetailLoadingView message="Loading credential details..." />}>
            <CredentialLoader credentialId={credentialId} />
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default Page;
