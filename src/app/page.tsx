"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

const Page = () => {
  const trpc = useTRPC(); 

  const { data: users } = useQuery(trpc.getUsers.queryOptions());

  return (
    <div className="min-h-screen flex items-center justify-center">
      {JSON.stringify(users)}
    </div>
  );
};

export default Page;
