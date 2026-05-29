import { type ReactNode } from "react";
import {
  LoaderCircle,
  CheckCircle2,
  XCircle,
  Clock,
  SkipForward,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { NodeStatus, NodeStatusVariant } from "@/types/node";

// ============================================================================
// Status Icon Components
// ============================================================================

const statusIcons: Record<NodeStatus, ReactNode> = {
  initial: null,
  loading: <LoaderCircle className="size-4 text-white animate-spin" />,
  success: <CheckCircle2 className="size-4 text-white" />,
  error: <XCircle className="size-4 text-white" />,
  skipped: <SkipForward className="size-3 text-white/80" />,
  pending: <Clock className="size-3 text-white/80" />,
};

// ============================================================================
// Badge Indicator (Compact - corner badge)
// ============================================================================

interface BadgeIndicatorProps {
  status: Exclude<NodeStatus, "initial">;
  className?: string;
  pulse?: boolean;
}

export const BadgeIndicator = ({
  status,
  className,
  pulse = false,
}: BadgeIndicatorProps) => {
  const badgeStyles: Record<Exclude<NodeStatus, "initial">, string> = {
    loading: "bg-blue-500",
    success: "bg-emerald-500",
    error: "bg-red-500 animate-error-shake",
    skipped: "bg-slate-400",
    pending: "bg-amber-500",
  };

  return (
    <div
      className={cn(
        "absolute top-1 right-1 z-50 w-6 h-6 rounded-full flex items-center justify-center shadow-md",
        badgeStyles[status],
        pulse && "animate-pulse",
        className,
      )}
    >
      {statusIcons[status]}
    </div>
  );
};

// ============================================================================
// Inline Indicator (For use inside node content)
// ============================================================================

interface InlineIndicatorProps {
  status: Exclude<NodeStatus, "initial">;
  className?: string;
}

export const InlineIndicator = ({
  status,
  className,
}: InlineIndicatorProps) => {
  const inlineStyles: Record<Exclude<NodeStatus, "initial">, string> = {
    loading: "bg-blue-500/20 text-blue-700 border-blue-200",
    success: "bg-emerald-500/20 text-emerald-700 border-emerald-200",
    error: "bg-red-500/20 text-red-700 border-red-200",
    skipped: "bg-slate-500/20 text-slate-700 border-slate-200",
    pending: "bg-amber-500/20 text-amber-700 border-amber-200",
  };

  const labels: Record<Exclude<NodeStatus, "initial">, string> = {
    loading: "Running...",
    success: "Completed",
    error: "Failed",
    skipped: "Skipped",
    pending: "Pending",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium border",
        inlineStyles[status],
        className,
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", {
        "bg-blue-500 animate-pulse": status === "loading",
        "bg-emerald-500": status === "success",
        "bg-red-500": status === "error",
        "bg-slate-500": status === "skipped",
        "bg-amber-500 animate-pulse": status === "pending",
      })} />
      {labels[status]}
    </div>
  );
};

// ============================================================================
// Border Indicator (Animated border)
// ============================================================================

interface BorderIndicatorProps {
  status: Exclude<NodeStatus, "initial">;
  children: ReactNode;
  className?: string;
}

export const BorderIndicator = ({
  status,
  children,
  className,
}: BorderIndicatorProps) => {
  const borderStyles: Record<Exclude<NodeStatus, "initial">, string> = {
    loading: "border-blue-500/60 bg-blue-500/5",
    success: "border-emerald-500/60 bg-emerald-500/5",
    error: "border-red-500/60 bg-red-500/5",
    skipped: "border-slate-400/60 bg-slate-500/5",
    pending: "border-amber-500/60 bg-amber-500/5",
  };

  return (
    <div className={cn("relative rounded-xl border-2", className)}>
      {/* Border glow */}
      <div className={cn(
        "absolute inset-[-2px] rounded-xl",
        borderStyles[status],
        status === "loading" && "animate-pulse",
        status === "pending" && "animate-pulse",
      )} />

      {/* Glow effect */}
      <div className={cn(
        "absolute inset-[-4px] rounded-xl blur-sm opacity-30",
        status === "loading" && "bg-blue-500",
        status === "success" && "bg-emerald-500",
        status === "error" && "bg-red-500",
        status === "skipped" && "bg-slate-500",
        status === "pending" && "bg-amber-500",
      )} />

      <div className="relative z-10">{children}</div>
    </div>
  );
};

// ============================================================================
// Spinner Overlay (Full overlay with blur)
// ============================================================================

interface SpinnerOverlayProps {
  children: ReactNode;
  className?: string;
}

export const SpinnerOverlay = ({
  children,
  className,
}: SpinnerOverlayProps) => {
  return (
    <div className={cn("relative", className)}>
      {/* Spinning border */}
      <div className="absolute inset-[-2px] overflow-hidden rounded-xl">
        <div className="absolute inset-0 animate-spin-slow">
          <div className="w-full h-full bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,transparent_270deg,#3b82f6_270deg,#3b82f6_300deg,transparent_300deg,transparent_360deg)]" />
        </div>
      </div>

      {/* Pulse ring */}
      <div className="absolute inset-[-4px] rounded-xl border-2 border-blue-500/30 animate-pulse" />

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

// ============================================================================
// Main NodeStatusIndicator Component
// ============================================================================

interface NodeStatusIndicatorProps {
  status?: NodeStatus;
  variant?: NodeStatusVariant;
  children: ReactNode;
  className?: string;
  pulse?: boolean;
}

export const NodeStatusIndicator = ({
  status,
  variant = "badge",
  children,
  className,
  pulse = false,
}: NodeStatusIndicatorProps) => {
  // Don't show anything for initial state
  if (status === "initial" || !status) {
    return <>{children}</>;
  }

  switch (variant) {
    case "badge":
      return (
        <div className={cn("relative", className)}>
          <BadgeIndicator status={status} pulse={pulse} />
          {children}
        </div>
      );

    case "border":
      return (
        <BorderIndicator status={status} className={className}>
          {children}
        </BorderIndicator>
      );

    case "overlay":
      return (
        <SpinnerOverlay className={className}>
          {children}
        </SpinnerOverlay>
      );

    case "inline":
      return (
        <div className={cn("relative", className)}>
          {children}
          <div className="absolute top-2 right-2 z-50">
            <InlineIndicator status={status} />
          </div>
        </div>
      );

    default:
      return (
        <div className={cn("relative", className)}>
          <BadgeIndicator status={status} pulse={pulse} />
          {children}
        </div>
      );
  }
};

// ============================================================================
// Utility exports
// ============================================================================

export const isTerminalStatus = (status: NodeStatus): boolean => {
  return status === "success" || status === "error" || status === "skipped";
};

export const isActiveStatus = (status: NodeStatus): boolean => {
  return status === "loading" || status === "pending";
};

// ============================================================================
// Custom Animations (Add to global CSS or include via style tag)
// ============================================================================

export const NodeStatusAnimations = () => (
  <style>
    {`
      @keyframes spin-slow {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      .animate-spin-slow {
        animation: spin-slow 2s linear infinite;
      }
      @keyframes error-shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-2px); }
        75% { transform: translateX(2px); }
      }
      .animate-error-shake {
        animation: error-shake 0.4s ease-in-out;
      }
      @keyframes status-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
      .animate-status-pulse {
        animation: status-pulse 1.5s ease-in-out infinite;
      }
    `}
  </style>
);