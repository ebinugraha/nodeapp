import type { inferInput } from "@trpc/tanstack-react-query";
import { prefetch, trpc } from "@/trpc/server";

type Input = inferInput<typeof trpc.executions.getMany>;

export const prefetchExecutions = async (params: Input) => {
  await prefetch(trpc.executions.getMany.queryOptions(params));
};

export const prefetchExecution = async (id: string) => {
  await prefetch(trpc.executions.getOne.queryOptions({ id }));
};
