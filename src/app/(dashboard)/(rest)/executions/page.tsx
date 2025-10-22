import { requireAuth } from "@/lib/auth-utils";

const Page = async () => {
  await requireAuth();

  return (
    <div>
      <p>executions</p>
    </div>
  );
};

export default Page;
