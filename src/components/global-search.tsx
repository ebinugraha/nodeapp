"use client";

import { useState, useCallback, useEffect } from "react";
import { WorkflowIcon, KeyIcon, HistoryIcon } from "lucide-react";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

interface WorkflowResult {
  id: string;
  name: string;
  updatedAt: Date;
}

interface CredentialResult {
  id: string;
  name: string;
  type: string;
  updatedAt: Date;
}

interface ExecutionResult {
  id: string;
  startedAt: Date;
  workflow: {
    id: string;
    name: string;
  };
}

interface SearchResult {
  id: string;
  name: string;
  type: "workflow" | "credential" | "execution";
  meta?: string;
  updatedAt: Date;
}

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const trpc = useTRPC();

  const { data: workflows = [], isLoading: isLoadingWorkflows } = useQuery({
    ...trpc.workflows.search.queryOptions({ query: query || undefined }),
    enabled: true,
  });

  const { data: credentials = [], isLoading: isLoadingCredentials } = useQuery({
    ...trpc.credentials.search.queryOptions({ query: query || undefined }),
    enabled: true,
  });

  const { data: executions = [], isLoading: isLoadingExecutions } = useQuery({
    ...trpc.executions.search.queryOptions({ query: query || undefined }),
    enabled: true,
  });

  const isLoading = isLoadingWorkflows || isLoadingCredentials || isLoadingExecutions;

  const allResults: SearchResult[] = [
    ...workflows.map((w: WorkflowResult) => ({
      id: w.id,
      name: w.name,
      type: "workflow" as const,
      updatedAt: w.updatedAt,
    })),
    ...credentials.map((c: CredentialResult) => ({
      id: c.id,
      name: c.name,
      type: "credential" as const,
      meta: c.type,
      updatedAt: c.updatedAt,
    })),
    ...executions.map((e: ExecutionResult) => ({
      id: e.id,
      name: e.workflow.name,
      type: "execution" as const,
      meta: e.id.slice(-8),
      updatedAt: e.startedAt,
    })),
  ];

  const hasAnyResults = workflows.length > 0 || credentials.length > 0 || executions.length > 0;

  const handleSelect = useCallback(
    (result: SearchResult) => {
      onOpenChange(false);
      switch (result.type) {
        case "workflow":
          router.push(`/workflows/${result.id}`);
          break;
        case "credential":
          router.push(`/credentials`);
          break;
        case "execution":
          router.push(`/executions/${result.id}`);
          break;
      }
    },
    [router, onOpenChange]
  );

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search workflows, credentials, executions..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>
          <span className="text-muted-foreground">No results found for &quot;{query}&quot;</span>
        </CommandEmpty>

        {allResults.length > 0 && (
          <>
            {workflows.length > 0 && (
              <CommandGroup heading="Workflows">
                {workflows.map((workflow: WorkflowResult) => (
                  <CommandItem
                    key={workflow.id}
                    value={workflow.id}
                    onSelect={() =>
                      handleSelect({
                        id: workflow.id,
                        name: workflow.name,
                        type: "workflow",
                        updatedAt: workflow.updatedAt,
                      })
                    }
                  >
                    <WorkflowIcon className="mr-2 size-4" />
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="truncate font-medium">{workflow.name}</span>
                      <span suppressHydrationWarning className="text-xs text-muted-foreground">
                        Updated {formatDistanceToNow(new Date(workflow.updatedAt), { addSuffix: true })}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {credentials.length > 0 && (
              <CommandGroup heading="Credentials">
                {credentials.map((credential: CredentialResult) => (
                  <CommandItem
                    key={credential.id}
                    value={credential.id}
                    onSelect={() =>
                      handleSelect({
                        id: credential.id,
                        name: credential.name,
                        type: "credential",
                        meta: credential.type,
                        updatedAt: credential.updatedAt,
                      })
                    }
                  >
                    <KeyIcon className="mr-2 size-4" />
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="truncate font-medium">{credential.name}</span>
                      <span className="text-xs text-muted-foreground">{credential.type}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {executions.length > 0 && (
              <CommandGroup heading="Executions">
                {executions.map((execution: ExecutionResult) => (
                  <CommandItem
                    key={execution.id}
                    value={execution.id}
                    onSelect={() =>
                      handleSelect({
                        id: execution.id,
                        name: execution.workflow.name,
                        type: "execution",
                        meta: execution.id.slice(-8),
                        updatedAt: execution.startedAt,
                      })
                    }
                  >
                    <HistoryIcon className="mr-2 size-4" />
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="truncate font-medium">{execution.workflow.name}</span>
                      <span suppressHydrationWarning className="text-xs text-muted-foreground">
                        ID: {execution.id.slice(-8)} • {formatDistanceToNow(new Date(execution.startedAt), { addSuffix: true })}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </>
        )}

        {!hasAnyResults && !isLoading && (
          <div className="py-6 text-center text-sm text-muted-foreground">
            No workflows, credentials, or executions yet
          </div>
        )}
      </CommandList>
    </CommandDialog>
  );
}

// Hook to control the search dialog
export function useGlobalSearch() {
  const [open, setOpen] = useState(false);

  return {
    open,
    setOpen,
    GlobalSearchDialog: () => <GlobalSearch open={open} onOpenChange={setOpen} />,
  };
}