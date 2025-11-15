"use client";

import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { useCredentialsParams } from "./use-credentials-params";
import { CredentialType } from "@/generated/prisma";

/**
 * Hook to fetch all credentials with suspense
 */
export const useSuspenseCredentials = () => {
  const trpc = useTRPC();
  const [params] = useCredentialsParams();

  return useSuspenseQuery(trpc.credentials.getAll.queryOptions(params));
};

/**
 * Hook to create a new credentials
 */

export const useCreateCredentials = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.credentials.create.mutationOptions({
      onSuccess: async (data) => {
        toast.success(`credentials "${data.name}" created`);
        await queryClient.invalidateQueries(
          trpc.credentials.getAll.queryOptions({})
        );
        await queryClient.invalidateQueries(
          trpc.credentials.getOne.queryFilter({ id: data.id })
        );
      },
      onError: (error) => {
        toast.error(`Failed to create credential : ${error.message}`);
      },
    })
  );
};

/**
 * Hook untuk menghapus workflows
 */
export const useRemoveCredentials = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.credentials.delete.mutationOptions({
      onSuccess: async (data) => {
        toast.success(`credentials "${data.name}" deleted`);
        await queryClient.invalidateQueries(
          trpc.credentials.getAll.queryOptions({})
        );
        await queryClient.invalidateQueries(
          trpc.credentials.getOne.queryFilter({ id: data.id })
        );
      },
      onError: (error) => {
        toast.error(`Failed to delete credential : ${error.message}`);
      },
    })
  );
};

/**
 * Hook untuk menghubah/menyimpan perubahan workflows
 * @returns update mutation
 */

export const useUpdateCredential = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.credentials.update.mutationOptions({
      onSuccess: async (data) => {
        toast.success(`Credential "${data.name}" saved`);
        await queryClient.invalidateQueries(
          trpc.credentials.getAll.queryOptions({})
        );
        await queryClient.invalidateQueries(
          trpc.credentials.getOne.queryFilter({ id: data.id })
        );
      },
      onError: (error) => {
        toast.error(`Failed to save credential : ${error.message}`);
      },
    })
  );
};

/**
 * Hook to fetch a get one workflow
 */
export const useSuspenseCredential = (id: string) => {
  const trpc = useTRPC();

  return useSuspenseQuery(trpc.credentials.getOne.queryOptions({ id }));
};

export const useCredentialsByType = (type: CredentialType) => {
  const trpc = useTRPC();

  return useQuery(trpc.credentials.getByType.queryOptions({ type }));
};
