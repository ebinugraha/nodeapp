"use client";

import type { Workflow, Node, Connection } from "@prisma/client";
import { format, formatDistanceToNow } from "date-fns";
import {
  AlertCircleIcon,
  ArrowRightIcon,
  CalendarIcon,
  ClockIcon,
  PlayIcon,
  Trash2Icon,
  WorkflowIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { WorkflowThumbnail } from "./workflow-thumbnail";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEntitySearch } from "@/hooks/use-entity-search";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import { cn } from "@/lib/utils";
import {
  useCreateWorkflow,
  useRemoveWorkflow,
  useSuspenseWorkflows,
} from "../hooks/use-workflows";
import { useWorkflowsParams } from "../hooks/use-workflows-params";

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
      sortBy={params.sortBy}
      onSortChange={(value) => setParams({ sortBy: value })}
      sortOptions={[
        { label: "Newest", value: "newest" },
        { label: "Oldest", value: "oldest" },
        { label: "Name (A-Z)", value: "name_asc" },
        { label: "Name (Z-A)", value: "name_desc" },
      ]}
      layout={params.layout as "grid" | "list"}
      onLayoutChange={(value) => setParams({ layout: value })}
    />
  );
};

export const WorkflowsList = () => {
  const workflows = useSuspenseWorkflows();
  const [params] = useWorkflowsParams();

  return (
    <EntityList
      className={params.layout === "grid" ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" : ""}
      items={workflows.data.items}
      getKey={(workflow) => workflow.id}
      renderItem={(workflow) => <WorkflowItem data={workflow} layout={params.layout as "grid" | "list"} />}
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

export const WorkflowItem = ({
  data,
  layout = "grid",
}: {
  data: Workflow & { executions?: { id: string }[]; nodes?: Node[]; connections?: Connection[] };
  layout?: "grid" | "list";
}) => {
  const removeWorkflow = useRemoveWorkflow();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    removeWorkflow.mutate({ id: data.id });
  };

  if (layout === "list") {
    return (
      <Link href={`/workflows/${data.id}`} className="block group prefetch">
        <div
          className={cn(
            "relative overflow-hidden rounded-xl border border-border/70 transition-all duration-200",
            "bg-card",
            "hover:border-primary/40 hover:shadow-md cursor-pointer",
            removeWorkflow.isPending && "opacity-50 pointer-events-none"
          )}
        >
          <div className="absolute inset-0 rounded-xl shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />

          <div className="px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className="flex items-center justify-center size-10 rounded-lg shrink-0 bg-primary/10 text-primary border border-primary/20">
                  <WorkflowIcon className="size-5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                      {data.name}
                    </h3>
                    {data.executions && data.executions.length > 0 && (
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        <span className="text-[10px] font-medium leading-none">Running</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-0.5">
                    <span suppressHydrationWarning>Edited {formatDistanceToNow(data.updatedAt, { addSuffix: true })}</span>
                    <span suppressHydrationWarning>Created {format(data.createdAt, "MMM d, yyyy")}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center shrink-0">
                {!showDeleteConfirm ? (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive hover:bg-destructive/10" 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowDeleteConfirm(true); }}
                  >
                    <Trash2Icon className="size-4" />
                  </Button>
                ) : (
                  <div className="flex items-center gap-1 animate-in fade-in" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                    <Button size="sm" variant="destructive" className="h-7 text-[10px] px-2" onClick={handleRemove} disabled={removeWorkflow.isPending}>Yes</Button>
                    <Button size="sm" variant="outline" className="h-7 text-[10px] px-2" onClick={() => setShowDeleteConfirm(false)} disabled={removeWorkflow.isPending}>No</Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/workflows/${data.id}`} className="block group prefetch h-full">
      <div
        className={cn(
          "relative flex flex-col h-full overflow-hidden rounded-xl border border-border/70 transition-all duration-200",
          "bg-card",
          "hover:border-primary/40 hover:shadow-md cursor-pointer",
          removeWorkflow.isPending && "opacity-50 pointer-events-none"
        )}
      >
        {/* Subtle glow overlay on hover */}
        <div className="absolute inset-0 rounded-xl shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10" />

        {/* Thumbnail Area */}
        <div className="relative w-full aspect-[16/10] bg-muted/20 border-b border-border/50 flex items-center justify-center overflow-hidden shrink-0">
          {/* Decorative grid pattern to simulate workflow canvas */}
          <div 
            className="absolute inset-0 opacity-10 pointer-events-none" 
            style={{ 
              backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', 
              backgroundSize: '16px 16px' 
            }} 
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50 pointer-events-none" />
          
          <WorkflowThumbnail nodes={data.nodes} connections={data.connections} />
          
          {/* Execution Badge overlapping thumbnail if running */}
          {data.executions && data.executions.length > 0 && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 backdrop-blur-sm z-10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-[10px] font-medium leading-none">Running</span>
            </div>
          )}
        </div>

        {/* Bottom Meta Area */}
        <div className="p-4 flex flex-col gap-1 bg-card flex-1 justify-center">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center justify-center size-8 rounded bg-primary/10 text-primary shrink-0 border border-primary/20">
                <WorkflowIcon className="size-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <h3 className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                  {data.name}
                </h3>
                <span suppressHydrationWarning className="text-xs text-muted-foreground truncate mt-0.5">
                  Edited {formatDistanceToNow(data.updatedAt, { addSuffix: true })}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center shrink-0">
               {!showDeleteConfirm ? (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive hover:bg-destructive/10" 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowDeleteConfirm(true); }}
                  >
                    <Trash2Icon className="size-4" />
                  </Button>
               ) : (
                 <div className="flex items-center gap-1 animate-in fade-in zoom-in-95" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                    <Button size="sm" variant="destructive" className="h-7 text-[10px] px-2" onClick={handleRemove} disabled={removeWorkflow.isPending}>
                       {removeWorkflow.isPending ? "..." : "Yes"}
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-[10px] px-2" onClick={() => setShowDeleteConfirm(false)} disabled={removeWorkflow.isPending}>
                       No
                    </Button>
                 </div>
               )}
            </div>
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
