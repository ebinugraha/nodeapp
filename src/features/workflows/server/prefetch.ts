import { prefetch, trpc } from "@/trpc/server";
import type { inferInput } from "@trpc/tanstack-react-query";

type Input = inferInput<typeof trpc.workflows.getAll>;

/**
 * Prefetch all workflows
 */

export const prefetchWorkflows = async (params: Input) => {
  return await prefetch(trpc.workflows.getAll.queryOptions(params));
};

export const prefetchWorkflow = async (id: string) => {
  return await prefetch(
    trpc.workflows.getOne.queryOptions({
      id,
    })
  );
};
