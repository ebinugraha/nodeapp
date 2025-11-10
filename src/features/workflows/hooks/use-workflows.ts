"use client";

import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { useWorkflowsParams } from "./use-workflows-params";

/**
 * Hook to fetch all workflows with suspense
 */

export const useSuspenseWorkflows = () => {
  const trpc = useTRPC();
  const [params] = useWorkflowsParams();

  return useSuspenseQuery(trpc.workflows.getAll.queryOptions(params));
};

/**
 * Hook to create a new workflow
 */

export const useCreateWorkflow = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.workflows.create.mutationOptions({
      onSuccess: async (data) => {
        toast.success(`Workflow "${data.name}" created`);
        await queryClient.invalidateQueries(
          trpc.workflows.getAll.queryOptions({})
        );
        await queryClient.invalidateQueries(
          trpc.workflows.getOne.queryFilter({ id: data.id })
        );
      },
      onError: (error) => {
        toast.error(`Failed to create workflow : ${error.message}`);
      },
    })
  );
};

/**
 * Hook untuk menghapus workflows
 */
export const useRemoveWorkflow = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.workflows.delete.mutationOptions({
      onSuccess: async (data) => {
        toast.success(`Workflow "${data.name}" removed`);
        await queryClient.invalidateQueries(
          trpc.workflows.getAll.queryOptions({})
        );
        await queryClient.invalidateQueries(
          trpc.workflows.getOne.queryFilter({ id: data.id })
        );
      },
      onError: (error) => {
        toast.error(`Failed to delete workflow : ${error.message}`);
      },
    })
  );
};

/**
 * Hook untuk menghubah/menyimpan perubahan workflows
 * @returns update mutation
 */

export const useUpdateWorkflow = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.workflows.update.mutationOptions({
      onSuccess: async (data) => {
        toast.success(`Workflow "${data.name}" saved`);
        await queryClient.invalidateQueries(
          trpc.workflows.getAll.queryOptions({})
        );
        await queryClient.invalidateQueries(
          trpc.workflows.getOne.queryFilter({ id: data.id })
        );
      },
      onError: (error) => {
        toast.error(`Failed to save workflow : ${error.message}`);
      },
    })
  );
};

/**
 * Hook to fetch a get one workflow
 */

export const useSuspenseWorkflow = (id: string) => {
  const trpc = useTRPC();

  return useSuspenseQuery(trpc.workflows.getOne.queryOptions({ id }));
};

export const useUpdateWorkflowName = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.workflows.updateName.mutationOptions({
      onSuccess: async (data) => {
        toast.success(`Workflow "${data.name}" updated`);
        await queryClient.invalidateQueries(
          trpc.workflows.getAll.queryOptions({})
        );
        await queryClient.invalidateQueries(
          trpc.workflows.getOne.queryOptions({ id: data.id })
        );
      },
      onError: (error) => {
        toast.error(`Failed to update workflow : ${error.message}`);
      },
    })
  );
};

export const useExecuteWorkflow = () => {
  const trpc = useTRPC();

  return useMutation(
    trpc.workflows.execute.mutationOptions({
      onSuccess: async (data) => {
        toast.success(`Workflow "${data.name}" executed`);
      },
      onError: (error) => {
        toast.error(`Failed to update workflow : ${error.message}`);
      },
    })
  );
};
