import { UpgradeModal } from "@/components/upgrade-modal";
import { TRPCClientError } from "@trpc/client";
import { useState } from "react";

// Payment system disabled - upgrade modal no longer functional
export const useUpgradeModal = () => {
  const [open, setOpen] = useState(false);

  const handleError = (error: unknown) => {
    // Payment system disabled - just return false
    // The modal will not be triggered for subscription errors anymore
    if (error instanceof TRPCClientError) {
      if (error.data?.code === "FORBIDDEN") {
        // Subscription checks disabled - just return false
        return false;
      }
    }
    return false;
  };

  const modal = <UpgradeModal open={open} onOpenChange={setOpen} />;

  return {
    handleError,
    modal,
  };
};