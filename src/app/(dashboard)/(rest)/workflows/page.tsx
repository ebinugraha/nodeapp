import { requireAuth } from "@/lib/auth-utils";

const Page = async () => {
  await requireAuth();

  return (
    <div>
      <p>Workflows</p>
    </div>
  );
};

export default Page;
