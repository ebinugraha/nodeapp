import { requireAuth } from "@/lib/auth-utils";

const Page = async () => {
  await requireAuth();

  return (
    <div className="min-h-screen flex items-center justify-center">madep</div>
  );
};

export default Page;
