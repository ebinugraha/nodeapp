"use client";

import {
  EmptyView,
  EntityContainer,
  EntityHeader,
  EntityItem,
  EntityList,
  EntityPagination,
  ErrorView,
  LoadingView,
} from "@/components/entity-components";

import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

import {
  Execution,
  ExecutionStatus,
} from "@prisma/client";
import {
  CheckIcon,
  ClockIcon,
  Loader2Icon,
  XCircleIcon,
  WorkflowIcon,
  ArrowRightIcon,
  TimerIcon,
} from "lucide-react";
import { useSuspenseExecutions } from "../hooks/use-executions";
import { useExecutionsParams } from "../hooks/use-executions-params";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";

export const ExecutionsList = () => {
  const executions = useSuspenseExecutions();

  return (
    <EntityList
      items={executions.data.items}
      getKey={(execution) => execution.id}
      renderItem={(execution) => <ExecutionItem data={execution} />}
      emptyView={<ExecutionsEmpty />}
      className="grid gap-4 sm:grid-cols-1"
    />
  );
};

export const ExecutionsHeader = () => {
  return (
    <EntityHeader
      title="Executions"
      description="Monitor your workflow execution history"
    />
  );
};

export const ExecutionsPagination = () => {
  const executions = useSuspenseExecutions();
  const [params, setParams] = useExecutionsParams();

  return (
    <EntityPagination
      disabled={executions.isFetching}
      totalPages={executions.data.totalPages}
      page={executions.data.page}
      onPageChange={(page) => setParams({ ...params, page })}
    />
  );
};

export const ExecutionslsLoading = () => {
  return <LoadingView message="Loading Executions..." />;
};

export const ExecutionsError = () => {
  return <ErrorView message="Failed to load executions" />;
};

export const ExecutionsEmpty = () => {
  return (
    <EmptyView message="No executions yet. Run your first workflow to see it here." />
  );
};

// Status configuration for visual styling
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
    default:
      return {
        icon: ClockIcon,
        label: "Pending",
        className: "bg-slate-500/10 text-slate-600 border-slate-500/20",
        iconClassName: "text-slate-500",
        dotClassName: "bg-slate-500",
      };
  }
};

export const ExecutionItem = ({
  data,
}: {
  data: Execution & { workflow: { id: string; name: string } };
}) => {
  const router = useRouter();
  const statusConfig = getStatusConfig(data.status);
  const StatusIcon = statusConfig.icon;

  const duration = data.completedAt
    ? Math.round(
        (new Date(data.completedAt).getTime() -
          new Date(data.startedAt).getTime()) /
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
    <Link
      href={`/executions/${data.id}`}
      className="block group"
      prefetch
    >
      <div className={cn(
        "relative overflow-hidden rounded-xl border border-border/70 transition-all duration-200",
        "bg-card",
        "hover:border-primary/40 hover:shadow-md cursor-pointer"
      )}>
        {/* Subtle glow/shadow overlay on hover */}
        <div className="absolute inset-0 rounded-xl shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Status indicator line */}
        <div className={cn(
          "absolute left-0 top-0 bottom-0 w-1",
          statusConfig.dotClassName
        )} />

        <div className="px-4 py-3">
          <div className="flex items-start justify-between gap-4">
            {/* Left side - Status and info */}
            <div className="flex items-start gap-3 min-w-0">
              {/* Status Badge */}
              <div className={cn(
                "flex items-center justify-center size-10 rounded-lg shrink-0",
                statusConfig.className
              )}>
                <StatusIcon className={cn("size-5", statusConfig.iconClassName)} />
              </div>

              <div className="flex flex-col justify-center min-w-0 space-y-0.5">
                {/* Workflow name */}
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                    {data.workflow.name}
                  </h3>
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-background uppercase tracking-wider">
                    {statusConfig.label}
                  </Badge>
                </div>

                {/* Error Preview (if failed) */}
                {data.status === ExecutionStatus.FAILED && data.error && (
                  <p className="text-[11px] text-red-600/90 dark:text-red-400/90 truncate max-w-[200px] sm:max-w-md">
                    {data.error}
                  </p>
                )}

                {/* Meta info */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground mt-1">
                  <span className="flex items-center gap-1.5 shrink-0">
                    <ClockIcon className="size-3" />
                    {formatDistanceToNow(data.startedAt, { addSuffix: true })}
                  </span>
                  {duration !== null && (
                    <span className="flex items-center gap-1.5 shrink-0">
                      <TimerIcon className="size-3" />
                      {formatDuration(duration)}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 text-muted-foreground/60 font-mono shrink-0">
                    <WorkflowIcon className="size-3" />
                    {data.id.slice(0, 8)}...
                  </span>
                </div>
              </div>
            </div>

            {/* Right side - Arrow */}
            <div className="flex items-center gap-2 h-10 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all group-hover:translate-x-1 shrink-0">
              <ArrowRightIcon className="size-4" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export const ExecutionsContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <EntityContainer
      header={<ExecutionsHeader />}
      pagination={<ExecutionsPagination />}
    >
      {children}
    </EntityContainer>
  );
};