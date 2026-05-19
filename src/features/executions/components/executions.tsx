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
} from "@/generated/prisma";
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
        bgClassName: "from-emerald-500/5 to-transparent",
      };
    case ExecutionStatus.FAILED:
      return {
        icon: XCircleIcon,
        label: "Failed",
        className: "bg-red-500/10 text-red-600 border-red-500/20",
        iconClassName: "text-red-500",
        dotClassName: "bg-red-500",
        bgClassName: "from-red-500/5 to-transparent",
      };
    case ExecutionStatus.RUNNING:
      return {
        icon: Loader2Icon,
        label: "Running",
        className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
        iconClassName: "text-blue-500 animate-spin",
        dotClassName: "bg-blue-500 animate-pulse",
        bgClassName: "from-blue-500/5 to-transparent",
      };
    default:
      return {
        icon: ClockIcon,
        label: "Pending",
        className: "bg-slate-500/10 text-slate-600 border-slate-500/20",
        iconClassName: "text-slate-500",
        dotClassName: "bg-slate-500",
        bgClassName: "from-slate-500/5 to-transparent",
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
        "relative overflow-hidden rounded-xl border bg-linear-to-l transition-all duration-200",
        statusConfig.bgClassName,
        "hover:border-primary/30 hover:shadow-md hover:scale-[1.01]",
        "cursor-pointer"
      )}>
        {/* Status indicator line */}
        <div className={cn(
          "absolute left-0 top-0 bottom-0 w-1",
          statusConfig.dotClassName
        )} />

        <div className="p-5 pl-6">
          <div className="flex items-start justify-between gap-4">
            {/* Left side - Status and info */}
            <div className="flex items-start gap-4">
              {/* Status Badge */}
              <div className={cn(
                "flex items-center justify-center size-12 rounded-xl border",
                statusConfig.className
              )}>
                <StatusIcon className={cn("size-5", statusConfig.iconClassName)} />
              </div>

              <div className="space-y-1">
                {/* Workflow name */}
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold group-hover:text-primary transition-colors">
                    {data.workflow.name}
                  </h3>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">
                    {statusConfig.label}
                  </Badge>
                </div>

                {/* Meta info */}
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <ClockIcon className="size-3.5" />
                    {formatDistanceToNow(data.startedAt, { addSuffix: true })}
                  </span>
                  {duration !== null && (
                    <span className="flex items-center gap-1">
                      <TimerIcon className="size-3.5" />
                      {formatDuration(duration)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right side - Arrow */}
            <div className="flex items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
              <ArrowRightIcon className="size-5" />
            </div>
          </div>

          {/* Event ID (subtle) */}
          <div className="mt-3 pt-3 border-t border-border/50">
            <p className="text-xs text-muted-foreground/60 font-mono">
              Event: {data.inngestEventId.slice(0, 24)}...
            </p>
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