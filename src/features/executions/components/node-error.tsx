"use client";

import { useState } from "react";
import {
  AlertTriangleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  RefreshCwIcon,
  XIcon,
  LightbulbIcon,
  ExternalLinkIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatErrorMessage, type NodeErrorData } from "@/types/node";
import { cn } from "@/lib/utils";

interface NodeErrorTooltipProps {
  error: NodeErrorData;
  onDismiss?: () => void;
  onRetry?: () => void;
  onConfigure?: () => void;
  className?: string;
}

export const NodeErrorTooltip = ({
  error,
  onDismiss,
  onRetry,
  onConfigure,
  className,
}: NodeErrorTooltipProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const { title, description, suggestion } = formatErrorMessage(error.error);

  return (
    <div
      className={cn(
        "absolute inset-0 z-50 rounded-xl overflow-hidden",
        "bg-linear-to-br from-red-500/10 to-red-600/5",
        "border-2 border-red-500/50",
        "shadow-lg shadow-red-500/20",
        className,
      )}
    >
      {/* Error header bar */}
      <div className="bg-red-500/20 px-3 py-1.5 flex items-center gap-2">
        <AlertTriangleIcon className="size-3.5 text-red-600" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-red-700">
          Error
        </span>
        <Badge
          variant="outline"
          className="ml-auto text-[9px] px-1.5 py-0 bg-red-100/50 text-red-700 border-red-300"
        >
          Click to expand
        </Badge>
      </div>

      {/* Error content */}
      <div className="p-3 space-y-2">
        <div className="flex items-start gap-2">
          <div className="size-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangleIcon className="size-4 text-red-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-red-900">{title}</p>
            <p className="text-xs text-red-700/80 line-clamp-2">{description}</p>
          </div>
        </div>

        {/* Suggestion */}
        {suggestion && (
          <div className="flex items-start gap-2 p-2 rounded-lg bg-blue-50 border border-blue-200">
            <LightbulbIcon className="size-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-800">{suggestion}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          {onRetry && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs gap-1 bg-white hover:bg-red-50 border-red-200"
              onClick={onRetry}
            >
              <RefreshCwIcon className="size-3" />
              Retry
            </Button>
          )}
          {onConfigure && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs gap-1 bg-white hover:bg-red-50 border-red-200"
              onClick={onConfigure}
            >
              Configure
            </Button>
          )}
          {onDismiss && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs gap-1 ml-auto text-muted-foreground"
              onClick={onDismiss}
            >
              <XIcon className="size-3" />
              Dismiss
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// Compact error indicator for use inside the node
interface NodeErrorIndicatorProps {
  error: NodeErrorData;
  onClick?: () => void;
  className?: string;
}

export const NodeErrorIndicator = ({
  error,
  onClick,
  className,
}: NodeErrorIndicatorProps) => {
  const { title, description } = formatErrorMessage(error.error);

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "flex items-center gap-2 p-2 rounded-lg",
              "bg-red-50 border border-red-200",
              "cursor-pointer hover:bg-red-100 transition-colors",
              className,
            )}
            onClick={onClick}
          >
            <div className="size-6 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 animate-error-pulse">
              <AlertTriangleIcon className="size-3 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-red-900 truncate">
                {title}
              </p>
              <p className="text-[10px] text-red-700/80 truncate">
                {description}
              </p>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-2 p-1">
            <p className="font-semibold text-sm">{title}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
            {formatErrorMessage(error.error).suggestion && (
              <div className="flex items-start gap-1.5 pt-1 border-t">
                <LightbulbIcon className="size-3 text-amber-600 mt-0.5" />
                <p className="text-xs text-amber-700">
                  {formatErrorMessage(error.error).suggestion}
                </p>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Expandable error panel for use inside the node content
interface NodeErrorPanelProps {
  error: NodeErrorData;
  onDismiss?: () => void;
  onRetry?: () => void;
  className?: string;
}

export const NodeErrorPanel = ({
  error,
  onDismiss,
  onRetry,
  className,
}: NodeErrorPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const { title, description, suggestion } = formatErrorMessage(error.error);

  return (
    <div
      className={cn(
        "rounded-lg border border-red-200 bg-red-50/50 overflow-hidden",
        className,
      )}
    >
      {/* Header - always visible */}
      <div
        className="flex items-center gap-2 p-2 cursor-pointer hover:bg-red-100/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="size-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
          <AlertTriangleIcon className="size-3 text-white" />
        </div>
        <p className="flex-1 text-xs font-medium text-red-900 truncate">
          {title}
        </p>
        {isExpanded ? (
          <ChevronUpIcon className="size-3.5 text-red-600" />
        ) : (
          <ChevronDownIcon className="size-3.5 text-red-600" />
        )}
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-3 pb-3 space-y-2">
          <p className="text-xs text-red-700">{description}</p>

          {suggestion && (
            <div className="flex items-start gap-1.5 p-2 rounded bg-blue-50 border border-blue-200">
              <LightbulbIcon className="size-3 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-800">{suggestion}</p>
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            {onRetry && (
              <Button
                size="sm"
                variant="outline"
                className="h-6 text-[10px] gap-1 bg-white hover:bg-red-50"
                onClick={(e) => {
                  e.stopPropagation();
                  onRetry();
                }}
              >
                <RefreshCwIcon className="size-2.5" />
                Retry
              </Button>
            )}
            {onDismiss && (
              <Button
                size="sm"
                variant="ghost"
                className="h-6 text-[10px] gap-1 ml-auto text-muted-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  onDismiss();
                }}
              >
                <XIcon className="size-2.5" />
                Dismiss
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Add CSS for error pulse animation
export const NodeErrorStyles = () => (
  <style>
    {`
      @keyframes error-pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.8; transform: scale(1.05); }
      }
      .animate-error-pulse {
        animation: error-pulse 2s ease-in-out infinite;
      }
    `}
  </style>
);