"use client";

import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

/**
 * Hook to fetch all workflows with suspense
 */

export const useSuspenseWorkflows = () => {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.workflows.getAll.queryOptions());
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
          trpc.workflows.getAll.queryOptions()
        );
      },
      onError: (error) => {
        toast.error(`Failed to create workflow : ${error.message}`);
      },
    })
  );
};
