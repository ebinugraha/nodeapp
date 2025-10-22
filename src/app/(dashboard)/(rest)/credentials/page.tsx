import { requireAuth } from "@/lib/auth-utils";

const Page = async () => {
  await requireAuth();

  return (
    <div>
      <p>credentials</p>
    </div>
  );
};

export default Page;
