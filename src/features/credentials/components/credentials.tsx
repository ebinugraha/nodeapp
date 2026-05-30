"use client";

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

import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import { useRouter } from "next/navigation";
import { useEntitySearch } from "@/hooks/use-entity-search";
import { formatDistanceToNow, format } from "date-fns";
import { useCredentialsParams } from "../hooks/use-credentials-params";
import {
  useCreateCredentials,
  useRemoveCredentials,
  useSuspenseCredentials,
} from "../hooks/use-credentials";
import { Credential, CredentialType } from "@prisma/client";
import {
  KeyIcon,
  PlusIcon,
  CalendarIcon,
  ShieldCheckIcon,
  Trash2Icon,
  ExternalLinkIcon,
  AlertCircleIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useState } from "react";
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
      className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
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
const credentialTypeConfig: Record<CredentialType, {
  label: string;
  logo: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
}> = {
  [CredentialType.OPENAI]: {
    label: "OpenAI",
    logo: "/logos/openai.svg",
    color: "text-emerald-600",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    description: "GPT models & AI services",
  },
  [CredentialType.ANTHROPIC]: {
    label: "Anthropic",
    logo: "/logos/anthropic.svg",
    color: "text-orange-600",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/30",
    description: "Claude & AI models",
  },
  [CredentialType.GEMINI]: {
    label: "Google Gemini",
    logo: "/logos/gemini.svg",
    color: "text-violet-600",
    bgColor: "bg-violet-500/10",
    borderColor: "border-violet-500/30",
    description: "Google's AI models",
  },
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
    logo: "/logos/google.svg",
    color: "text-blue-600",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    description: "Google Sheets API",
  },
};

export const CredentialCard = ({ data }: { data: Credential }) => {
  const removeCredential = useRemoveCredentials();
  const [isRemoving, setIsRemoving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const config = credentialTypeConfig[data.type] || credentialTypeConfig[CredentialType.OPENAI];

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
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border/70 transition-all duration-200 py-3 px-4",
        "hover:shadow-md hover:border-primary/40",
        isRemoving && "opacity-50"
      )}
    >
      {/* Subtle glow/shadow overlay on hover */}
      <div className="absolute inset-0 rounded-xl shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Left accent bar */}
      <div className={cn(
        "absolute top-0 left-0 bottom-0 w-1",
        isConnected ? "bg-emerald-500" : "bg-slate-400"
      )} />

      <div className="px-4 py-1.5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            {/* Logo */}
            <div className={cn(
              "flex items-center justify-center size-10 rounded-xl",
              config.bgColor
            )}>
              <Image
                src={config.logo}
                alt={config.label}
                width={20}
                height={20}
                className="object-contain"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                  {data.name}
                </h3>
                {isConnected ? (
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-emerald-50 text-emerald-700 border-emerald-200">
                    Connected
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-slate-50 text-slate-600 border-slate-200">
                    API Key
                  </Badge>
                )}
                {/* Quota badge for YouTube credentials */}
                {data.type === CredentialType.YOUTUBE && (
                  <QuotaBadge credentialId={data.id} />
                )}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {config.description}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 text-muted-foreground transition-opacity">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8"
                    asChild
                  >
                    <Link href={`/credentials/${data.id}`}>
                      <ExternalLinkIcon className="size-4" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit credential</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Metadata */}
        <div className="mt-2 pt-2 border-t border-border/50">
          <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 cursor-help">
                    <div suppressHydrationWarning className="flex items-center gap-1.5">
                      <CalendarIcon className="size-3.5" />
                      <span>Created {formatDistanceToNow(data.createdAt, { addSuffix: true })}</span>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {format(data.createdAt, "PPpp")}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 cursor-help">
                    <ShieldCheckIcon className="size-3.5" />
                    <span>{isOAuth ? "OAuth 2.0" : "API Key"}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {isOAuth ? "Uses OAuth 2.0 authentication" : "Uses API key authentication"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Delete confirmation */}
        {showDeleteConfirm && (
          <div className="mt-3 p-2.5 rounded-lg bg-red-50 border border-red-200 dark:bg-red-950/20 dark:border-red-900/30">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircleIcon className="size-4 text-red-600" />
              <p className="text-xs font-medium text-red-900 dark:text-red-300">
                Delete this credential?
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="destructive"
                className="h-7 text-xs"
                onClick={handleDelete}
                disabled={isRemoving}
              >
                {isRemoving ? "Deleting..." : "Delete"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Delete button */}
        {!showDeleteConfirm && (
          <div className="mt-2 pt-2 border-t border-border/50 flex justify-end">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1.5 transition-all"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2Icon className="size-3.5" />
              Delete
            </Button>
          </div>
        )}
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