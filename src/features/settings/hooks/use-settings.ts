"use client";

import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { queryOptions } from "@tanstack/react-query";

export const useSuspenseSettings = () => {
  const trpc = useTRPC();

  return useSuspenseQuery(
    trpc.settings.get.queryOptions(),
  );
};

export const useSettings = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useSuspenseQuery(
    trpc.settings.get.queryOptions(),
  );

  const updateMutation = useMutation(
    trpc.settings.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.settings.get.queryOptions());
        toast.success("Preferences saved");
      },
      onError: (error) => {
        toast.error(`Failed to save: ${error.message}`);
      },
    }),
  );

  const updateProfileMutation = useMutation(
    trpc.settings.updateProfile.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.settings.get.queryOptions());
        toast.success("Profile updated successfully");
      },
      onError: (error) => {
        toast.error(`Failed to update profile: ${error.message}`);
      },
    }),
  );

  const changePasswordMutation = useMutation(
    trpc.settings.changePassword.mutationOptions({
      onSuccess: () => {
        toast.success("Password changed successfully");
      },
      onError: (error) => {
        toast.error(`Failed to change password: ${error.message}`);
      },
    }),
  );

  return {
    settings,
    isLoading,
    updateSettings: updateMutation.mutate,
    updateSettingsAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateProfile: updateProfileMutation.mutate,
    isUpdatingProfile: updateProfileMutation.isPending,
    changePassword: changePasswordMutation.mutate,
    isChangingPassword: changePasswordMutation.isPending,
  };
};