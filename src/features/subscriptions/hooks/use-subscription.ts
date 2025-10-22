import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";

export const useSubscription = () => {
  return useQuery({
    queryKey: ["subscription"],
    queryFn: async () => {
      const { data } = await authClient.customer.state();
      return data;
    },
  });
};

export const useHasActiveSubscription = () => {
  const { data: subscription, isLoading, ...rest } = useSubscription();

  const hasActiveSubscription =
    subscription?.activeSubscriptions &&
    subscription.activeSubscriptions.length > 0;

  return {
    hasActiveSubscription,
    subscription: subscription?.activeSubscriptions?.[0],
    isLoading,
    ...rest,
  };
};
