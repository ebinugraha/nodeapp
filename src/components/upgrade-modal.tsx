"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckIcon } from "lucide-react";

export function UpgradeModal() {
  const [open, setOpen] = useState(false);
  const { data: session } = authClient.useSession();
  
  // No client-side constants needed here anymore

  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener("openUpgradeModal", handleOpen);
    return () => window.removeEventListener("openUpgradeModal", handleOpen);
  }, []);

  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleUpgrade = async () => {
    setIsRedirecting(true);
    try {
      const response = await fetch("/api/subscription/checkout");
      const data = await response.json();
      if (data.url) {
        window.open(data.url, "_blank");
        setOpen(false);
      } else {
        console.error("Failed to generate checkout URL", data.error);
      }
    } catch (error) {
      console.error("Checkout request failed", error);
    } finally {
      setIsRedirecting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upgrade to PRO</DialogTitle>
          <DialogDescription>
            You have reached the limits of the Free plan. Upgrade to PRO to unlock more features!
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          {/* Free Plan */}
          <div className="flex flex-col border border-muted rounded-lg p-6">
            <h3 className="font-semibold text-lg">Free Plan</h3>
            <p className="text-sm text-muted-foreground mb-4">Perfect for getting started</p>
            <div className="text-3xl font-bold">Rp 0 <span className="text-sm font-normal text-muted-foreground">/ forever</span></div>
            <ul className="space-y-2 text-sm mt-6 mb-6 flex-1">
              <li className="flex items-center gap-2"><CheckIcon className="size-4 text-primary" /> Max 3 Workflows</li>
              <li className="flex items-center gap-2"><CheckIcon className="size-4 text-primary" /> Max 5 Nodes per Workflow</li>
              <li className="flex items-center gap-2"><CheckIcon className="size-4 text-primary" /> Min 60s Polling Interval</li>
              <li className="flex items-center gap-2 text-muted-foreground line-through opacity-70"><CheckIcon className="size-4" /> Google Sheets Integration</li>
              <li className="flex items-center gap-2 text-muted-foreground line-through opacity-70"><CheckIcon className="size-4" /> Discord Notifications</li>
            </ul>
            <Button className="w-full mt-auto" variant="outline" onClick={() => setOpen(false)}>
              Continue with Free
            </Button>
          </div>

          {/* Pro Plan */}
          <div className="flex flex-col border border-primary/50 bg-primary/5 relative overflow-hidden rounded-lg p-6">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
              RECOMMENDED
            </div>
            <h3 className="font-semibold text-lg">Pro Plan</h3>
            <p className="text-sm text-muted-foreground mb-4">For serious automation builders</p>
            <div className="text-3xl font-bold">Rp 99.000 <span className="text-sm font-normal text-muted-foreground">/ month</span></div>
            <ul className="space-y-2 text-sm mt-6 mb-6 flex-1">
              <li className="flex items-center gap-2"><CheckIcon className="size-4 text-primary" /> Unlimited Workflows</li>
              <li className="flex items-center gap-2"><CheckIcon className="size-4 text-primary" /> Unlimited Nodes</li>
              <li className="flex items-center gap-2"><CheckIcon className="size-4 text-primary" /> Polling &lt; 60 seconds</li>
              <li className="flex items-center gap-2"><CheckIcon className="size-4 text-primary" /> Google Sheets Integration</li>
              <li className="flex items-center gap-2"><CheckIcon className="size-4 text-primary" /> Discord Notifications</li>
              <li className="flex items-center gap-2"><CheckIcon className="size-4 text-primary" /> Premium Support</li>
            </ul>
            <Button className="w-full mt-auto" onClick={handleUpgrade} disabled={isRedirecting}>
              {isRedirecting ? "Generating checkout..." : "Upgrade Now"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
