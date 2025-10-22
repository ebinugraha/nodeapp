import { requireAuth } from "@/lib/auth-utils";

interface PageProps {
  params: Promise<{ credentialId: string }>;
}

const Page = async ({ params }: PageProps) => {
  await requireAuth();
  const { credentialId } = await params;

  return (
    <div>
      <p>credentials id : {credentialId}</p>
    </div>
  );
};

export default Page;
