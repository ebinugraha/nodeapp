import { useState, useTransition } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { CheckIcon, Loader2, MoreVertical, Crown, CalendarClock, Trash2 } from "lucide-react";
import { cancelSubscription } from "../actions/subscription";
import { toast } from "sonner";
import { format, differenceInDays } from "date-fns";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";

export const PlanSettings = () => {
  const { data: session, refetch } = authClient.useSession();
  const [isPending, startTransition] = useTransition();
  const [isCancelling, setIsCancelling] = useState(false);

  // Replace with your actual Pakkasir checkout link
  const PAKKASIR_CHECKOUT_LINK = "https://app.pakasir.com/pay/cleenchat";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = session?.user as any;
  const isPro = user?.plan === "PRO";
  const planExpiresAt = user?.planExpiresAt ? new Date(user.planExpiresAt) : null;

  const handleCancelSubscription = () => {
    setIsCancelling(true);
    startTransition(async () => {
      try {
        await cancelSubscription();
        toast.success("Subscription cancelled successfully");
        await refetch();
      } catch (error) {
        toast.error("Failed to cancel subscription");
      } finally {
        setIsCancelling(false);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Subscription Plan
          <div className="flex items-center gap-2">
            {isPro && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                    onClick={handleCancelSubscription}
                    disabled={isPending || isCancelling}
                  >
                    {isPending || isCancelling ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="mr-2 h-4 w-4" />
                    )}
                    <span>Cancel Subscription</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardTitle>
        <CardDescription>
          Manage your plan and billing options
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isPro && planExpiresAt && (() => {
          const daysRemaining = Math.max(0, differenceInDays(planExpiresAt, new Date()));
          const daysPassed = Math.max(0, 30 - daysRemaining);
          const progressPercent = Math.max(0, Math.min(100, (daysPassed / 30) * 100));
          
          return (
            <Card className="border-primary/20 shadow-sm overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">PRO Plan Active</CardTitle>
                <CardDescription>You are enjoying premium features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between text-sm mb-2 mt-2 font-medium">
                  <span className="flex items-center gap-1.5 text-muted-foreground"><CalendarClock className="w-4 h-4" /> {daysRemaining} days remaining</span>
                  <span>Valid until {format(planExpiresAt, "dd MMM yyyy")}</span>
                </div>
                <Progress value={progressPercent} className="h-2" />
              </CardContent>
            </Card>
          );
        })()}
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Free Plan */}
          <Card className="flex flex-col border-muted">
            <CardHeader>
              <CardTitle>Free Plan</CardTitle>
              <CardDescription>Perfect for getting started</CardDescription>
              <div className="mt-4 text-3xl font-bold">Rp 0 <span className="text-sm font-normal text-muted-foreground">/ forever</span></div>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2"><CheckIcon className="size-4 text-primary" /> Max 3 Workflows</li>
                <li className="flex items-center gap-2"><CheckIcon className="size-4 text-primary" /> Max 5 Nodes per Workflow</li>
                <li className="flex items-center gap-2"><CheckIcon className="size-4 text-primary" /> Min 60s Polling Interval</li>
                <li className="flex items-center gap-2 text-muted-foreground line-through opacity-70"><CheckIcon className="size-4" /> Google Sheets Integration</li>
                <li className="flex items-center gap-2 text-muted-foreground line-through opacity-70"><CheckIcon className="size-4" /> Discord Notifications</li>
              </ul>
            </CardContent>
            <div className="p-6 pt-0 mt-auto">
              <Button className="w-full" variant="outline" disabled>{isPro ? "Downgrade" : "Current Plan"}</Button>
            </div>
          </Card>

          {/* Pro Plan */}
          <Card className="flex flex-col border-primary/50 bg-primary/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
              RECOMMENDED
            </div>
            <CardHeader>
              <CardTitle>Pro Plan</CardTitle>
              <CardDescription>For serious automation builders</CardDescription>
              <div className="mt-4 text-3xl font-bold">Rp 20.000 <span className="text-sm font-normal text-muted-foreground">/ month</span></div>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2"><CheckIcon className="size-4 text-primary" /> Unlimited Workflows</li>
                <li className="flex items-center gap-2"><CheckIcon className="size-4 text-primary" /> Unlimited Nodes</li>
                <li className="flex items-center gap-2"><CheckIcon className="size-4 text-primary" /> Polling &lt; 60 seconds</li>
                <li className="flex items-center gap-2"><CheckIcon className="size-4 text-primary" /> Google Sheets Integration</li>
                <li className="flex items-center gap-2"><CheckIcon className="size-4 text-primary" /> Discord Notifications</li>
                <li className="flex items-center gap-2"><CheckIcon className="size-4 text-primary" /> Premium Support</li>
              </ul>
            </CardContent>
            <div className="p-6 pt-0 mt-auto flex flex-col gap-3">
              {isPro ? (
                <Button
                  className="w-full"
                  variant="default"
                  disabled
                >
                  Current Plan (Active)
                </Button>
              ) : (
                <Button
                  className="w-full"
                  variant="default"
                  onClick={() => {
                    const amount = 20000;
                    const orderId = session?.user?.id ? `${session.user.id}_${Date.now()}` : `USER_${Date.now()}`;
                    const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/settings` : '';
                    window.open(`${PAKKASIR_CHECKOUT_LINK}/${amount}?order_id=${encodeURIComponent(orderId)}&email=${encodeURIComponent(session?.user?.email || '')}&redirect=${encodeURIComponent(redirectUrl)}`, "_blank");
                  }}
                >
                  Upgrade to Pro
                </Button>
              )}
            </div>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};
