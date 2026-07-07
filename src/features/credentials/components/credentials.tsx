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
  const router = useRouter();
  const removeCredential = useRemoveCredentials();
  const [isRemoving, setIsRemoving] = useState(false);
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

  const handleDelete = async () => {
    setIsRemoving(true);
    try {
      await removeCredential.mutateAsync({ id: data.id });
      toast.success("Credential deleted");
    } catch {
      toast.error("Failed to delete credential");
    } finally {
      setIsRemoving(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <Card
      onClick={() => {
        if (!showDeleteConfirm && !isRemoving) {
          router.push(`/credentials/${data.id}`);
        }
      }}
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border/70 transition-all duration-200 py-3 px-4",
        "hover:shadow-md hover:border-primary/40 cursor-pointer bg-card hover:bg-accent/10",
        isRemoving && "opacity-50",
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

      <div className="pl-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Section: Logo & Info */}
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div
            className={cn(
              "flex shrink-0 items-center justify-center size-12 rounded-xl",
              config.bgColor,
            )}
          >
            <Image
              src={config.logo}
              alt={config.label}
              width={24}
              height={24}
              className="object-contain"
            />
          </div>

          <div className="flex-1 min-w-0 flex flex-col">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold truncate group-hover:text-primary transition-colors text-sm">
                {data.name}
              </h3>
              {isConnected ? (
                <Badge
                  variant="outline"
                  className="text-[10px] px-2 py-0 bg-emerald-50 text-emerald-700 border-emerald-200"
                >
                  Connected
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-[10px] px-2 py-0 bg-slate-50 text-slate-600 border-slate-200"
                >
                  API Key
                </Badge>
              )}

            </div>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              {config.description}
            </p>
          </div>
        </div>

        {/* Right Section: Metadata and Delete */}
        <div className="flex items-center justify-between md:justify-end gap-6 text-[11px] text-muted-foreground border-t md:border-t-0 md:border-l border-border/50 pt-3 md:pt-0 md:pl-6">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex flex-col gap-1 md:items-end cursor-help">
                  <span className="font-medium text-foreground flex items-center gap-1.5">
                    <ShieldCheckIcon className="size-3.5" />
                    {isOAuth ? "OAuth 2.0" : "API Key"}
                  </span>
                  <div
                    suppressHydrationWarning
                    className="flex items-center gap-1.5"
                  >
                    <CalendarIcon className="size-3.5" />
                    <span>
                      Created{" "}
                      {formatDistanceToNow(data.createdAt, { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {isOAuth
                    ? "Uses OAuth 2.0 authentication"
                    : "Uses API key authentication"}
                </p>
                <p className="text-muted-foreground">
                  {format(data.createdAt, "PPpp")}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            {!showDeleteConfirm ? (
              <Button
                size="icon"
                variant="ghost"
                className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(true);
                }}
              >
                <Trash2Icon className="size-4" />
              </Button>
            ) : (
              <div className="flex flex-col items-center gap-2 rounded-lg bg-red-50 p-2 border border-red-200 dark:bg-red-950/20 dark:border-red-900/30">
                <p className="text-xs font-medium text-red-900 dark:text-red-300">
                  Delete?
                </p>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-6 text-[10px] px-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete();
                    }}
                    disabled={isRemoving}
                  >
                    Yes
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 text-[10px] px-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteConfirm(false);
                    }}
                  >
                    No
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
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
