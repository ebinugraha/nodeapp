"use client";

import { useState } from "react";
import { useYoutubeQuotaUsage, useResetYoutubeQuota, useTestYoutubeConnection } from "../hooks/use-credentials";
import {
  ActivityIcon,
  AlertTriangleIcon,
  CalendarIcon,
  CheckCircle2Icon,
  ClockIcon,
  ExternalLinkIcon,
  RefreshCwIcon,
  RotateCcwIcon,
  TrendingUpIcon,
  WifiIcon,
  XCircleIcon,
  SettingsIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface QuotaDisplayProps {
  credentialId: string;
  className?: string;
  initialDailyLimit?: number;
  initialMonthlyLimit?: number;
}

export const QuotaDisplay = ({
  credentialId,
  className,
  initialDailyLimit = 10000,
  initialMonthlyLimit = 1000000,
}: QuotaDisplayProps) => {
  const { data: quota, isLoading, error, refetch } = useYoutubeQuotaUsage(credentialId);
  const resetQuota = useResetYoutubeQuota();
  const testConnection = useTestYoutubeConnection();
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [dailyLimit, setDailyLimit] = useState(initialDailyLimit.toString());
  const [monthlyLimit, setMonthlyLimit] = useState(initialMonthlyLimit.toString());

  const handleTestConnection = async () => {
    setTestResult(null);

    try {
      const result = await testConnection.mutateAsync({ id: credentialId });
      setTestResult({ success: result.success, message: result.message });
      if (result.success) {
        toast.success("Connection test successful!");
      }
    } catch (err) {
      setTestResult({ success: false, message: "Connection test failed" });
      toast.error("Connection test failed");
    }
  };

  const handleResetQuota = async (type: "daily" | "monthly" | "both") => {
    try {
      await resetQuota.mutateAsync({ id: credentialId, type });
      toast.success(`Quota reset successfully`);
      refetch();
    } catch {
      toast.error("Failed to reset quota");
    }
  };

  if (isLoading) {
    return (
      <Card className={cn("", className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <ActivityIcon className="size-4" />
            API Quota Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <RefreshCwIcon className="size-4 animate-spin" />
            Loading quota information...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !quota) {
    return (
      <Card className={cn("border-red-200 bg-red-50/50", className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2 text-red-700">
            <AlertTriangleIcon className="size-4" />
            Quota Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-red-600 mb-3">
            Unable to fetch quota information
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => refetch()}
            className="gap-2"
          >
            <RefreshCwIcon className="size-3" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const getProgressColor = (percentage: number, isOverLimit: boolean) => {
    if (isOverLimit) return "bg-red-500";
    if (percentage > 80) return "bg-amber-500";
    return "bg-emerald-500";
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3 border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <ActivityIcon className="size-4 text-primary" />
            API Quota Usage
          </CardTitle>
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] px-1.5",
              quota.daily.isOverLimit || quota.monthly.isOverLimit
                ? "bg-red-100 text-red-700 border-red-200"
                : "bg-emerald-100 text-emerald-700 border-emerald-200"
            )}
          >
            {quota.daily.isOverLimit || quota.monthly.isOverLimit ? (
              <>
                <XCircleIcon className="size-3 mr-1" />
                Over Limit
              </>
            ) : (
              <>
                <CheckCircle2Icon className="size-3 mr-1" />
                Active
              </>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {/* Daily Quota */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-blue-500" />
              <span className="text-xs font-medium">Daily Quota</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {formatNumber(quota.daily.used)} / {formatNumber(quota.daily.limit)}
            </span>
          </div>
          <div className="space-y-1">
            <Progress
              value={Math.min(quota.daily.percentage, 100)}
              className="h-2"
              indicatorClassName={getProgressColor(quota.daily.percentage, quota.daily.isOverLimit)}
            />
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span>{quota.daily.percentage}% used</span>
              <span>{formatNumber(quota.daily.remaining)} remaining</span>
            </div>
          </div>
        </div>

        {/* Monthly Quota */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-violet-500" />
              <span className="text-xs font-medium">Monthly Quota</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {formatNumber(quota.monthly.used)} / {formatNumber(quota.monthly.limit)}
            </span>
          </div>
          <div className="space-y-1">
            <Progress
              value={Math.min(quota.monthly.percentage, 100)}
              className="h-2"
              indicatorClassName={getProgressColor(quota.monthly.percentage, quota.monthly.isOverLimit)}
            />
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span>{quota.monthly.percentage}% used</span>
              <span>{formatNumber(quota.monthly.remaining)} remaining</span>
            </div>
          </div>
        </div>

        {/* Warning banner if near limit */}
        {(quota.daily.isNearLimit || quota.monthly.isNearLimit) && (
          <div className="flex items-start gap-2 p-2 rounded-lg bg-amber-50 border border-amber-200">
            <AlertTriangleIcon className="size-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-amber-800">
              <p className="font-medium">Quota Warning</p>
              <p className="text-amber-700/80 mt-0.5">
                {quota.daily.isNearLimit && "Daily quota is above 80%"}
                {quota.daily.isNearLimit && quota.monthly.isNearLimit && " and "}
                {quota.monthly.isNearLimit && "Monthly quota is above 80%"}
              </p>
            </div>
          </div>
        )}

        {/* Test Connection Result */}
        {testResult && (
          <div className={cn(
            "flex items-start gap-2 p-2 rounded-lg border",
            testResult.success
              ? "bg-emerald-50 border-emerald-200"
              : "bg-red-50 border-red-200"
          )}>
            {testResult.success ? (
              <CheckCircle2Icon className="size-4 text-emerald-600 mt-0.5" />
            ) : (
              <XCircleIcon className="size-4 text-red-600 mt-0.5" />
            )}
            <p className={cn(
              "text-xs",
              testResult.success ? "text-emerald-700" : "text-red-700"
            )}>
              {testResult.message}
            </p>
          </div>
        )}

        {/* Reset info */}
        <div className="pt-3 border-t border-border/50">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <ClockIcon className="size-3.5 text-muted-foreground" />
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Daily Reset
                </p>
                <p className="text-xs font-medium">
                  {formatDistanceToNow(quota.resetInfo.dailyResetsAt, { addSuffix: true })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CalendarIcon className="size-3.5 text-muted-foreground" />
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Monthly Reset
                </p>
                <p className="text-xs font-medium">
                  {formatDistanceToNow(quota.resetInfo.monthlyResetsAt, { addSuffix: true })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-3 border-t border-border/50">
          {/* Test Connection Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={handleTestConnection}
            disabled={testConnection.isPending}
            className="h-8 text-xs gap-1.5"
          >
            {testConnection.isPending ? (
              <RefreshCwIcon className="size-3 animate-spin" />
            ) : (
              <WifiIcon className="size-3" />
            )}
            Test Connection
          </Button>

          {/* Reset Quota Dropdown */}
          <Dialog open={showSettings} onOpenChange={setShowSettings}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs gap-1.5"
              >
                <RotateCcwIcon className="size-3" />
                Reset
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Reset Quota</DialogTitle>
                <DialogDescription>
                  Choose which quota to reset. This will set usage back to 0.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Button
                  variant="outline"
                  onClick={() => handleResetQuota("daily")}
                  disabled={resetQuota.isPending}
                  className="justify-start"
                >
                  <RotateCcwIcon className="size-4 mr-2" />
                  Reset Daily Quota
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleResetQuota("monthly")}
                  disabled={resetQuota.isPending}
                  className="justify-start"
                >
                  <RotateCcwIcon className="size-4 mr-2" />
                  Reset Monthly Quota
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleResetQuota("both")}
                  disabled={resetQuota.isPending}
                  className="justify-start text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                >
                  <RotateCcwIcon className="size-4 mr-2" />
                  Reset Both
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Refresh Button */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => refetch()}
            className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground ml-auto"
          >
            <RefreshCwIcon className="size-3" />
            Refresh
          </Button>
        </div>

        {/* Google Cloud Console Link */}
        <div className="pt-3 border-t border-border/50">
          <a
            href="https://console.cloud.google.com/apis/credentials"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <ExternalLinkIcon className="size-3" />
            View in Google Cloud Console
          </a>
        </div>
      </CardContent>
    </Card>
  );
};

// Compact quota badge for list view
export const QuotaBadge = ({ credentialId }: { credentialId: string }) => {
  const { data: quota, isLoading } = useYoutubeQuotaUsage(credentialId);

  if (isLoading || !quota) {
    return null;
  }

  const getColor = () => {
    if (quota.daily.isOverLimit || quota.monthly.isOverLimit) {
      return "bg-red-100 text-red-700 border-red-200";
    }
    if (quota.daily.isNearLimit || quota.monthly.isNearLimit) {
      return "bg-amber-100 text-amber-700 border-amber-200";
    }
    return "bg-emerald-100 text-emerald-700 border-emerald-200";
  };

  return (
    <Badge variant="outline" className={cn("text-[10px] gap-1", getColor())}>
      <TrendingUpIcon className="size-2.5" />
      {quota.daily.percentage}%
    </Badge>
  );
};