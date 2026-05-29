"use client";

import { ExecutionStatus } from "@prisma/client";
import {
  CheckIcon,
  ClockIcon,
  Loader2Icon,
  XCircleIcon,
  WorkflowIcon,
  CalendarIcon,
  TimerIcon,
  HashIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  AlertTriangleIcon,
  ArrowRightIcon,
} from "lucide-react";
import { useState } from "react";
import { useSuspenseExecution } from "../hooks/use-executions";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const getStatusConfig = (status: ExecutionStatus) => {
  switch (status) {
    case ExecutionStatus.SUCCESS:
      return {
        icon: CheckIcon,
        label: "Success",
        className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
        iconClassName: "text-emerald-500",
        dotClassName: "bg-emerald-500",
      };
    case ExecutionStatus.FAILED:
      return {
        icon: XCircleIcon,
        label: "Failed",
        className: "bg-red-500/10 text-red-600 border-red-500/20",
        iconClassName: "text-red-500",
        dotClassName: "bg-red-500",
      };
    case ExecutionStatus.RUNNING:
      return {
        icon: Loader2Icon,
        label: "Running",
        className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
        iconClassName: "text-blue-500 animate-spin",
        dotClassName: "bg-blue-500 animate-pulse",
      };
  }
};

export const ExecutionView = ({ executionId }: { executionId: string }) => {
  const { data: execution } = useSuspenseExecution(executionId);
  const [showStackTrace, setShowStackTrace] = useState(false);

  const statusConfig = getStatusConfig(execution.status);
  const StatusIcon = statusConfig.icon;

  const duration = execution.completedAt
    ? Math.round(
        (new Date(execution.completedAt).getTime() -
          new Date(execution.startedAt).getTime()) /
          1000,
      )
    : null;

  const formatDuration = (seconds: number | null) => {
    if (seconds === null) return "—";
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="relative overflow-hidden rounded-xl border bg-linear-to-br from-card to-card/80">
        {/* Status indicator bar */}
        <div className={cn(
          "absolute top-0 left-0 right-0 h-1",
          execution.status === ExecutionStatus.SUCCESS && "bg-linear-to-r from-emerald-500 to-teal-500",
          execution.status === ExecutionStatus.FAILED && "bg-linear-to-r from-red-500 to-rose-500",
          execution.status === ExecutionStatus.RUNNING && "bg-linear-to-r from-blue-500 to-cyan-500 animate-pulse",
        )} />

        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Status Icon */}
              <div className={cn(
                "flex items-center justify-center size-14 rounded-xl border",
                statusConfig.className
              )}>
                <StatusIcon className={cn("size-7", statusConfig.iconClassName)} />
              </div>

              <div>
                <h1 className="text-xl font-semibold">
                  {statusConfig.label}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Execution for <span className="font-medium text-foreground">{execution.workflow.name}</span>
                </p>
              </div>
            </div>

            {/* Workflow Link */}
            <Badge variant="outline" className="gap-1.5">
              <WorkflowIcon className="size-3.5" />
              <Link
                href={`/workflows/${execution.workflow.id}`}
                className="hover:underline"
              >
                View Workflow
              </Link>
            </Badge>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <MetaItem
              icon={CalendarIcon}
              label="Started"
              value={formatDistanceToNow(execution.startedAt, { addSuffix: true })}
              fullValue={format(execution.startedAt, "PPpp")}
            />
            <MetaItem
              icon={TimerIcon}
              label="Duration"
              value={formatDuration(duration)}
            />
            <MetaItem
              icon={ClockIcon}
              label="Completed"
              value={execution.completedAt
                ? formatDistanceToNow(execution.completedAt, { addSuffix: true })
                : "—"
              }
              fullValue={execution.completedAt ? format(execution.completedAt, "PPpp") : undefined}
            />
            <MetaItem
              icon={HashIcon}
              label="Event ID"
              value={execution.inngestEventId.slice(0, 12) + "..."}
              fullValue={execution.inngestEventId}
              copyable
            />
          </div>
        </div>
      </div>

      {/* Error Section */}
      {execution.error && (
        <div className="rounded-xl border border-red-200 bg-red-50/50 dark:bg-red-950/20 dark:border-red-900/30 overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-red-200/50 dark:border-red-900/30 bg-red-100/50 dark:bg-red-950/30">
            <div className="flex items-center justify-center size-8 rounded-lg bg-red-500/10">
              <AlertTriangleIcon className="size-4 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-red-900 dark:text-red-300">
                Execution Error
              </h3>
              <p className="text-xs text-red-700/70 dark:text-red-400/70">
                This execution failed due to an error
              </p>
            </div>
          </div>

          <div className="p-5 space-y-4">
            <div className="p-4 rounded-lg bg-red-100/50 dark:bg-red-950/50 border border-red-200/50 dark:border-red-900/50">
              <p className="text-xs uppercase tracking-wider text-red-700/60 dark:text-red-400/60 font-medium mb-1.5">
                Error Message
              </p>
              <p className="text-sm font-mono text-red-900 dark:text-red-300">
                {execution.error}
              </p>
            </div>

            {execution.errorStack && (
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowStackTrace(!showStackTrace)}
                  className="text-red-700 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-950"
                >
                  {showStackTrace ? (
                    <>
                      <ChevronUpIcon className="size-4 mr-1.5" />
                      Hide Stack Trace
                    </>
                  ) : (
                    <>
                      <ChevronDownIcon className="size-4 mr-1.5" />
                      Show Stack Trace
                    </>
                  )}
                </Button>

                {showStackTrace && (
                  <div className="mt-3 p-4 rounded-lg bg-red-100/50 dark:bg-red-950/50 border border-red-200/50 dark:border-red-900/50">
                    <pre className="text-xs font-mono text-red-900 dark:text-red-300 overflow-x-auto whitespace-pre-wrap">
                      {execution.errorStack}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Output Section */}
      {execution.output && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b bg-muted/30">
            <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10">
              <ArrowRightIcon className="size-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Output</h3>
              <p className="text-xs text-muted-foreground">
                Execution result data
              </p>
            </div>
          </div>

          <div className="p-5">
            <pre className="text-sm font-mono bg-muted/50 rounded-lg p-4 overflow-x-auto border">
              {JSON.stringify(execution.output, null, 2)}
            </pre>
          </div>
        </div>
      )}

          </div>
  );
};

// Meta item component
function MetaItem({
  icon: Icon,
  label,
  value,
  fullValue,
  copyable = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  fullValue?: string;
  copyable?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (fullValue) {
      navigator.clipboard.writeText(fullValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const content = (
    <div className="p-3 rounded-lg bg-muted/30 border border-transparent hover:border-border transition-colors">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="size-3.5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="text-sm font-medium truncate" title={fullValue || value}>
        {value}
      </p>
    </div>
  );

  if (copyable && fullValue) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="cursor-pointer" onClick={handleCopy}>
              {content}
              {copied && (
                <span className="absolute mt-1 text-xs text-green-600">
                  Copied!
                </span>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Click to copy {label.toLowerCase()}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return <div>{content}</div>;
}