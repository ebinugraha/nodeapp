"use client";

import { type Credential, CredentialType } from "@prisma/client";
import { format, formatDistanceToNow } from "date-fns";
import {
  AlertCircleIcon,
  CalendarIcon,
  ExternalLinkIcon,
  KeyIcon,
  PlusIcon,
  ShieldCheckIcon,
  Trash2Icon,
  ArrowRightIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  EmptyView,
  EntityContainer,
  EntityHeader,
  EntityList,
  EntityPagination,
  EntitySearch,
  ErrorView,
  LoadingView,
} from "@/components/entity-components";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEntitySearch } from "@/hooks/use-entity-search";
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import { cn } from "@/lib/utils";
import {
  useCreateCredentials,
  useRemoveCredentials,
  useSuspenseCredentials,
} from "../hooks/use-credentials";
import { useCredentialsParams } from "../hooks/use-credentials-params";
import { QuotaBadge } from "./quota-display";

export const CredentialSearch = () => {
  const [params, setParams] = useCredentialsParams();
  const { searchValue, onSearchChange } = useEntitySearch({
    params,
    setParams,
  });

  return (
    <EntitySearch
      value={searchValue}
      onChange={(value) => onSearchChange(value)}
      placeholder="Search credentials..."
      sortBy={params.sortBy}
      onSortChange={(value) => setParams({ sortBy: value })}
      sortOptions={[
        { label: "Newest", value: "newest" },
        { label: "Oldest", value: "oldest" },
        { label: "Name (A-Z)", value: "name_asc" },
        { label: "Name (Z-A)", value: "name_desc" },
      ]}
    />
  );
};

export const CredentialsList = () => {
  const credentials = useSuspenseCredentials();

  return (
    <EntityList
      items={credentials.data.items}
      getKey={(credential) => credential.id}
      renderItem={(credential) => <CredentialCard data={credential} />}
      emptyView={<CredentialEmpty />}
      className="flex flex-col gap-3"
    />
  );
};

export const CredentialsHeader = ({ disabled }: { disabled?: boolean }) => {
  return (
    <EntityHeader
      title="Credentials"
      description="Securely manage your API keys and OAuth connections"
      newButtonLabel="New Credential"
      newButtonHref={"/credentials/new"}
      disabled={disabled}
    />
  );
};

export const CredentialsPagination = () => {
  const credentials = useSuspenseCredentials();
  const [params, setParams] = useCredentialsParams();

  return (
    <EntityPagination
      disabled={credentials.isFetching}
      totalPages={credentials.data.totalPages}
      page={credentials.data.page}
      onPageChange={(page) => setParams({ ...params, page })}
    />
  );
};

export const CredentialsLoading = () => {
  return <LoadingView message="Loading credentials..." />;
};

export const CredentialsError = () => {
  return <ErrorView message="Failed to load credentials" />;
};

export const CredentialEmpty = () => {
  const router = useRouter();

  const handleCreate = () => {
    router.push("/credentials/new");
  };

  return (
    <EmptyView
      onNew={handleCreate}
      message="No credentials yet. Add your first API key or OAuth connection to get started."
    />
  );
};

// Credential type configurations
const credentialTypeConfig: Record<
  CredentialType,
  {
    label: string;
    logo: string;
    color: string;
    bgColor: string;
    borderColor: string;
    description: string;
  }
> = {

  [CredentialType.YOUTUBE]: {
    label: "YouTube",
    logo: "/logos/youtube.svg",
    color: "text-red-600",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    description: "YouTube API & Live Chat",
  },
  [CredentialType.GOOGLE]: {
    label: "Google Sheets",
    logo: "/logos/google-sheet.svg",
    color: "text-blue-600",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    description: "Google Sheets API",
  },
};

export const CredentialCard = ({ data }: { data: Credential }) => {
  const removeCredential = useRemoveCredentials();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const config =
    credentialTypeConfig[data.type] ||
    credentialTypeConfig[CredentialType.YOUTUBE];

  // Check if credential is an OAuth type (stored as JSON)
  const isOAuth = data.value.startsWith("{");
  let isConnected = false;

  if (isOAuth) {
    try {
      const json = JSON.parse(data.value);
      isConnected = !!json.access_token;
    } catch {
      isConnected = false;
    }
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    removeCredential.mutate({ id: data.id });
  };

  return (
    <Link href={`/credentials/${data.id}`} className="block group prefetch">
      <div
        className={cn(
          "relative overflow-hidden rounded-xl border border-border/70 transition-all duration-200",
          "bg-card",
          "hover:border-primary/40 hover:shadow-md cursor-pointer",
          removeCredential.isPending && "opacity-50",
        )}
      >
        {/* Subtle glow/shadow overlay on hover */}
        <div className="absolute inset-0 rounded-xl shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Left accent bar */}
        <div
          className={cn(
            "absolute top-0 left-0 bottom-0 w-1",
            isConnected ? "bg-emerald-500" : "bg-slate-400",
          )}
        />

        <div className="px-4 py-3">
          <div className="flex items-start justify-between gap-4">
            {/* Left side - Icon and info */}
            <div className="flex items-start gap-3 min-w-0">
              <div
                className={cn(
                  "flex items-center justify-center size-10 rounded-lg shrink-0 border transition-colors",
                  config.bgColor,
                  config.borderColor
                )}
              >
                <Image
                  src={config.logo}
                  alt={config.label}
                  width={20}
                  height={20}
                  className="object-contain"
                />
              </div>

              <div className="flex flex-col justify-center min-w-0 space-y-1">
                {/* Name & Badge */}
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                    {data.name}
                  </h3>
                  {isConnected ? (
                    <Badge
                      variant="outline"
                      className="text-[9px] px-1.5 py-0 h-4 bg-emerald-50 text-emerald-700 border-emerald-200 uppercase"
                    >
                      Connected
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-[9px] px-1.5 py-0 h-4 bg-slate-50 text-slate-600 border-slate-200 uppercase"
                    >
                      API Key
                    </Badge>
                  )}
                </div>

                {/* Meta info */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground mt-0.5">
                  <span className="flex items-center gap-1.5 shrink-0">
                    <ShieldCheckIcon className="size-3" />
                    {isOAuth ? "OAuth 2.0" : "API Key"}
                  </span>
                  <span
                    suppressHydrationWarning
                    className="flex items-center gap-1.5 shrink-0"
                    title={format(data.createdAt, "PPpp")}
                  >
                    <CalendarIcon className="size-3" />
                    Created {formatDistanceToNow(data.createdAt, { addSuffix: true })}
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
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-destructive/10 border border-destructive/20 mr-2">
                  <AlertCircleIcon className="size-3.5 text-destructive" />
                  <span className="text-xs font-medium text-destructive">
                    Delete?
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-8 text-xs"
                  onClick={handleRemove}
                  disabled={removeCredential.isPending}
                >
                  {removeCredential.isPending ? "..." : "Yes"}
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
                  disabled={removeCredential.isPending}
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

export const CredentialsContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <EntityContainer
      header={<CredentialsHeader />}
      search={<CredentialSearch />}
      pagination={<CredentialsPagination />}
    >
      {children}
    </EntityContainer>
  );
};
