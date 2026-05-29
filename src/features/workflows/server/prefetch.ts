import { caller } from "@/trpc/server";
import type { inferAsyncReturnType } from "@trpc/server";

type Workflow = inferAsyncReturnType<typeof caller.workflows.getOne>;

/**
 * Prefetch workflow data for server components
 */
export const prefetchWorkflow = async (id: string): Promise<Workflow> => {
  return await caller.workflows.getOne({ id });
};

/**
 * Prefetch all workflows
 */
export const prefetchWorkflows = async (params: {
  page?: number;
  pageSize?: number;
  search?: string;
}) => {
  return await caller.workflows.getAll(params);
};
