"use client";

import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { NodeType } from "@prisma/client";

export const useTemplates = () => {
  const trpc = useTRPC();
  return useQuery(trpc.templates.getAll.queryOptions());
};

export const useTemplatesByNodeType = (nodeType: NodeType) => {
  const trpc = useTRPC();
  return useQuery(trpc.templates.getByNodeType.queryOptions({ nodeType }));
};

export const useTemplate = (id: string) => {
  const trpc = useTRPC();
  return useQuery(trpc.templates.getOne.queryOptions({ id }));
};

export const useCreateTemplate = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.templates.create.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Template "${data.name}" created`);
        queryClient.invalidateQueries(trpc.templates.getAll.queryOptions());
      },
      onError: (error) => {
        toast.error(`Failed to create template: ${error.message}`);
      },
    }),
  );
};

export const useUpdateTemplate = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.templates.update.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Template "${data.name}" updated`);
        queryClient.invalidateQueries(trpc.templates.getAll.queryOptions());
        queryClient.invalidateQueries(trpc.templates.getOne.queryOptions({ id: data.id }));
      },
      onError: (error) => {
        toast.error(`Failed to update template: ${error.message}`);
      },
    }),
  );
};

export const useDeleteTemplate = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.templates.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Template deleted");
        queryClient.invalidateQueries(trpc.templates.getAll.queryOptions());
      },
      onError: (error) => {
        toast.error(`Failed to delete template: ${error.message}`);
      },
    }),
  );
};
