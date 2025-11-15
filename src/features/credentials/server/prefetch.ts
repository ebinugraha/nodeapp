import { prefetch, trpc } from "@/trpc/server";
import { inferInput } from "@trpc/tanstack-react-query";

type Input = inferInput<typeof trpc.credentials.getAll>;

export const prefetchCredentials = async (params: Input) => {
  await prefetch(trpc.workflows.getAll.queryOptions(params));
};

export const prefetchCredential = async (id: string) => {
  await prefetch(trpc.credentials.getOne.queryOptions({ id }));
};
