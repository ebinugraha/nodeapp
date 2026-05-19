import { type ReactNode } from "react";
import { LoaderCircle, CheckCircle2, XCircle, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

export type NodeStatus = "loading" | "success" | "error" | "initial";

export type NodeStatusVariant = "overlay" | "border" | "badge";

export type NodeStatusIndicatorProps = {
  status?: NodeStatus;
  variant?: NodeStatusVariant;
  children: ReactNode;
  className?: string;
};

// Spinner overlay indicator - full overlay with blur
export const SpinnerLoadingIndicator = ({
  children,
}: {
  children: ReactNode;
}) => {
  return (
    <div className="relative">
      <div className="absolute -left-[2px] -top-[2px] h-[calc(100%+4px)] w-[calc(100%+4px)] overflow-hidden rounded-xl">
        <div className="absolute inset-0 animate-spin-slow">
          <div className="w-full h-full bg-linear-conic from-blue-500 via-cyan-500 to-blue-500 opacity-80" />
        </div>
      </div>

      {/* Pulsing ring effect */}
      <div className="absolute -left-[4px] -top-[4px] h-[calc(100%+8px)] w-[calc(100%+8px)] rounded-xl border-2 border-blue-500/30 animate-pulse" />

      {/* Blur overlay */}
      <div className="absolute inset-0 z-10 rounded-xl bg-background/70 backdrop-blur-sm" />

      {/* Center spinner */}
      <div className="absolute inset-0 z-20 flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 animate-ping opacity-30">
            <Sparkles className="size-8 text-blue-500" />
          </div>
          <LoaderCircle className="size-8 text-blue-600 animate-spin" />
        </div>
      </div>

      <div className="relative z-30">{children}</div>
    </div>
  );
};

// Border loading indicator - animated border only
export const BorderLoadingIndicator = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("relative", className)}>
      {/* Animated gradient border */}
      <div className="absolute -left-[2px] -top-[2px] h-[calc(100%+4px)] w-[calc(100%+4px)] overflow-hidden rounded-xl">
        <div className="w-full h-full animate-spin-slow">
          <div className="w-full h-full bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,transparent_270deg,#3b82f6_270deg,#3b82f6_300deg,transparent_300deg,transparent_360deg)]" />
        </div>
      </div>

      {/* Inner glow */}
      <div className="absolute -left-[2px] -top-[2px] h-[calc(100%+4px)] w-[calc(100%+4px)] rounded-xl bg-blue-500/10 blur-sm animate-pulse" />

      {children}
    </div>
  );
};

// Success indicator with checkmark
export const SuccessIndicator = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("relative", className)}>
      {/* Success glow border */}
      <div className="absolute -left-[2px] -top-[2px] h-[calc(100%+4px)] w-[calc(100%+4px)] rounded-xl border-2 border-emerald-500/60" />

      {/* Success corner badge */}
      <div className="absolute -top-2 -right-2 z-10">
        <div className="size-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg border-2 border-background animate-success-bounce">
          <CheckCircle2 className="size-4 text-white" />
        </div>
      </div>

      {/* Subtle success glow */}
      <div className="absolute -left-[2px] -top-[2px] h-[calc(100%+4px)] w-[calc(100%+4px)] rounded-xl bg-emerald-500/10 blur-sm" />

      {children}
    </div>
  );
};

// Error indicator with X mark
export const ErrorIndicator = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("relative", className)}>
      {/* Error glow border */}
      <div className="absolute -left-[2px] -top-[2px] h-[calc(100%+4px)] w-[calc(100%+4px)] rounded-xl border-2 border-red-500/60" />

      {/* Error corner badge */}
      <div className="absolute -top-2 -right-2 z-10">
        <div className="size-6 rounded-full bg-red-500 flex items-center justify-center shadow-lg border-2 border-background animate-error-shake">
          <XCircle className="size-4 text-white" />
        </div>
      </div>

      {/* Subtle error glow */}
      <div className="absolute -left-[2px] -top-[2px] h-[calc(100%+4px)] w-[calc(100%+4px)] rounded-xl bg-red-500/10 blur-sm" />

      {children}
    </div>
  );
};

// Badge variant - compact badge on corner
export const BadgeIndicator = ({
  status,
  className,
}: {
  status: NodeStatus;
  className?: string;
}) => {
  return (
    <div className={cn("absolute -top-2 -right-2 z-10", className)}>
      {status === "loading" && (
        <div className="size-6 rounded-full bg-blue-500 flex items-center justify-center shadow-lg border-2 border-background">
          <LoaderCircle className="size-4 text-white animate-spin" />
        </div>
      )}
      {status === "success" && (
        <div className="size-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg border-2 border-background">
          <CheckCircle2 className="size-4 text-white" />
        </div>
      )}
      {status === "error" && (
        <div className="size-6 rounded-full bg-red-500 flex items-center justify-center shadow-lg border-2 border-background">
          <XCircle className="size-4 text-white" />
        </div>
      )}
    </div>
  );
};

export const NodeStatusIndicator = ({
  status,
  variant = "badge",
  children,
  className,
}: NodeStatusIndicatorProps) => {
  switch (status) {
    case "loading":
      switch (variant) {
        case "overlay":
          return <SpinnerLoadingIndicator>{children}</SpinnerLoadingIndicator>;
        case "border":
          return (
            <BorderLoadingIndicator className={className}>
              {children}
            </BorderLoadingIndicator>
          );
        default:
          return (
            <div className={cn("relative", className)}>
              <BadgeIndicator status={status} />
              {children}
            </div>
          );
      }
    case "success":
      switch (variant) {
        case "overlay":
        case "border":
          return (
            <SuccessIndicator className={className}>
              {children}
            </SuccessIndicator>
          );
        default:
          return (
            <div className={cn("relative", className)}>
              <BadgeIndicator status={status} />
              {children}
            </div>
          );
      }
    case "error":
      switch (variant) {
        case "overlay":
        case "border":
          return (
            <ErrorIndicator className={className}>
              {children}
            </ErrorIndicator>
          );
        default:
          return (
            <div className={cn("relative", className)}>
              <BadgeIndicator status={status} />
              {children}
            </div>
          );
      }
    default:
      return <>{children}</>;
  }
};

// Add custom animations via style tag
export const CustomNodeStyles = () => (
  <style>
    {`
      @keyframes spin-slow {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      .animate-spin-slow {
        animation: spin-slow 2s linear infinite;
      }
      @keyframes success-bounce {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }
      .animate-success-bounce {
        animation: success-bounce 0.5s ease-out;
      }
      @keyframes error-shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-2px); }
        75% { transform: translateX(2px); }
      }
      .animate-error-shake {
        animation: error-shake 0.4s ease-in-out;
      }
    `}
  </style>
);