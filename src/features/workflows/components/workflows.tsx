"use client";

import {
  EmptyView,
  EntityContainer,
  EntityHeader,
  EntityItem,
  EntityList,
  EntityPagination,
  EntitySearch,
  ErrorView,
  LoadingView,
} from "@/components/entity-components";
import {
  useCreateWorkflow,
  useRemoveWorkflow,
  useSuspenseWorkflows,
} from "../hooks/use-workflows";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import { useRouter } from "next/navigation";
import { useWorkflowsParams } from "../hooks/use-workflows-params";
import { useEntitySearch } from "@/hooks/use-entity-search";
import type { Workflow } from "@prisma/client";
import { WorkflowIcon, ClockIcon, ArrowRightIcon, Trash2Icon, AlertCircleIcon, PlayIcon, CalendarIcon } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";

export const WorkflowSearch = () => {
  const [params, setParams] = useWorkflowsParams();
  const { searchValue, onSearchChange } = useEntitySearch({
    params,
    setParams,
  });

  return (
    <EntitySearch
      value={searchValue}
      onChange={(value) => onSearchChange(value)}
      placeholder="Search workflow"
    />
  );
};

export const WorkflowsList = () => {
  const workflows = useSuspenseWorkflows();

  return (
    <EntityList
      items={workflows.data.items}
      getKey={(workflow) => workflow.id}
      renderItem={(workflow) => <WorkflowItem data={workflow} />}
      emptyView={<WorkflowsEmpty />}
    />
  );
};

export const WorkflowsHeader = ({ disabled }: { disabled?: boolean }) => {
  const createWorklow = useCreateWorkflow();
  const { handleError, modal } = useUpgradeModal();
  const router = useRouter();

  const handleCreate = () => {
    createWorklow.mutate(undefined, {
      onSuccess: (data) => {
        router.push(`/workflows/${data.id}`);
      },
      onError: (error) => {
        handleError(error);
      },
    });
  };

  return (
    <>
      {modal}
      <EntityHeader
        title="Workflows"
        description="Create and manage your workflows"
        onNew={handleCreate}
        newButtonLabel="New Workflow"
        disabled={disabled}
        isCreating={createWorklow.isPending}
      />
    </>
  );
};

export const WorkflowsPagination = () => {
  const workflows = useSuspenseWorkflows();
  const [params, setParams] = useWorkflowsParams();

  return (
    <EntityPagination
      disabled={workflows.isFetching}
      totalPages={workflows.data.totalPages}
      page={workflows.data.page}
      onPageChange={(page) => setParams({ ...params, page })}
    />
  );
};

export const WorkflowsLoading = () => {
  return <LoadingView message="Loading workflows..." />;
};

export const WorkflowsError = () => {
  return <ErrorView message="Workflows Error..." />;
};

export const WorkflowsEmpty = () => {
  const createWorkflow = useCreateWorkflow();
  const { handleError, modal } = useUpgradeModal();
  const router = useRouter();

  const handleCreate = () => {
    createWorkflow.mutate(undefined, {
      onError: (error) => {
        handleError(error);
      },
      onSuccess: (data) => {
        router.push(`/workflows/${data.id}`);
      },
    });
  };

  return (
    <>
      {modal}
      <EmptyView
        onNew={handleCreate}
        message="You haven't created any workflows"
      />
    </>
  );
};

export const WorkflowItem = ({ data }: { data: Workflow }) => {
  const removeWorkflow = useRemoveWorkflow();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    removeWorkflow.mutate({ id: data.id });
  };

  return (
    <Link href={`/workflows/${data.id}`} className="block group prefetch">
      <div className={cn(
        "relative overflow-hidden rounded-xl border border-border/70 transition-all duration-200",
        "bg-card",
        "hover:border-primary/40 hover:shadow-md cursor-pointer",
        removeWorkflow.isPending && "opacity-50"
      )}>
        {/* Subtle glow/shadow overlay on hover */}
        <div className="absolute inset-0 rounded-xl shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Left accent bar */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />

        <div className="px-4 py-3">
          <div className="flex items-start justify-between gap-4">
            {/* Left side - Icon and info */}
            <div className="flex items-start gap-3 min-w-0">
              <div className="flex items-center justify-center size-10 rounded-lg shrink-0 bg-primary/10 text-primary border border-primary/20 transition-colors">
                <WorkflowIcon className="size-5" />
              </div>

              <div className="flex flex-col justify-center min-w-0 space-y-1">
                {/* Workflow name */}
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                    {data.name}
                  </h3>
                </div>

                {/* Meta info */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground mt-0.5">
                  <span suppressHydrationWarning className="flex items-center gap-1.5 shrink-0" title={format(data.updatedAt, "PPpp")}>
                    <ClockIcon className="size-3" />
                    Updated {formatDistanceToNow(data.updatedAt, { addSuffix: true })}
                  </span>
                  <span suppressHydrationWarning className="flex items-center gap-1.5 shrink-0" title={format(data.createdAt, "PPpp")}>
                    <CalendarIcon className="size-3" />
                    Created {format(data.createdAt, "MMM d, yyyy")}
                  </span>
                  <span className="flex items-center gap-1.5 text-muted-foreground/60 font-mono shrink-0">
                    ID: {data.id.slice(0, 8)}...
                  </span>
                </div>
              </div>
            </div>

            {/* Right side - Arrow (default state) */}
            {!showDeleteConfirm && (
              <div className="flex items-center gap-2 h-10 text-muted-foreground transition-all shrink-0">
                {/* Delete trigger */}
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-8 opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all z-10"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowDeleteConfirm(true);
                  }}
                >
                  <Trash2Icon className="size-4" />
                </Button>
                
                <div className="opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all group-hover:translate-x-1">
                  <ArrowRightIcon className="size-4" />
                </div>
              </div>
            )}

            {/* Right side - Delete Confirm State */}
            {showDeleteConfirm && (
              <div 
                className="flex items-center gap-2 h-10 shrink-0 z-10 animate-in fade-in zoom-in-95"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              >
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-destructive/10 border border-destructive/20 mr-2">
                  <AlertCircleIcon className="size-3.5 text-destructive" />
                  <span className="text-xs font-medium text-destructive">Delete?</span>
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-8 text-xs"
                  onClick={handleRemove}
                  disabled={removeWorkflow.isPending}
                >
                  {removeWorkflow.isPending ? "..." : "Yes"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 text-xs hover:bg-muted"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowDeleteConfirm(false);
                  }}
                  disabled={removeWorkflow.isPending}
                >
                  No
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export const WorkflowsContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <EntityContainer
      header={<WorkflowsHeader />}
      search={<WorkflowSearch />}
      pagination={<WorkflowsPagination />}
    >
      {children}
    </EntityContainer>
  );
};
