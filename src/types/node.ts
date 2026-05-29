import { type LucideIcon } from "lucide-react";

// Node status types
export type NodeStatus = "initial" | "loading" | "success" | "error" | "skipped" | "pending";

// Node status variant for different visual styles
export type NodeStatusVariant = "badge" | "border" | "overlay" | "inline";

// Node categories
export type NodeCategory =
  | "trigger"
  | "action"
  | "ai"
  | "logic"
  | "moderation"
  | "notification";

// Category configuration for consistent styling
export interface CategoryConfig {
  gradient: string;
  border: string;
  iconBg: string;
  iconColor: string;
  label: string;
  badgeBg: string;
  badgeText: string;
}

// Default category configurations
export const categoryConfig: Record<NodeCategory, CategoryConfig> = {
  trigger: {
    gradient: "from-amber-500/20 to-orange-500/10",
    border: "border-amber-500/40",
    iconBg: "bg-amber-500/20",
    iconColor: "text-amber-600",
    label: "Trigger",
    badgeBg: "bg-amber-500",
    badgeText: "text-amber-600",
  },
  action: {
    gradient: "from-slate-500/20 to-gray-500/10",
    border: "border-slate-500/40",
    iconBg: "bg-slate-500/20",
    iconColor: "text-slate-600",
    label: "Action",
    badgeBg: "bg-slate-500",
    badgeText: "text-slate-600",
  },
  ai: {
    gradient: "from-violet-500/20 to-purple-500/10",
    border: "border-violet-500/40",
    iconBg: "bg-violet-500/20",
    iconColor: "text-violet-600",
    label: "AI",
    badgeBg: "bg-violet-500",
    badgeText: "text-violet-600",
  },
  logic: {
    gradient: "from-emerald-500/20 to-teal-500/10",
    border: "border-emerald-500/40",
    iconBg: "bg-emerald-500/20",
    iconColor: "text-emerald-600",
    label: "Logic",
    badgeBg: "bg-emerald-500",
    badgeText: "text-emerald-600",
  },
  moderation: {
    gradient: "from-red-500/20 to-pink-500/10",
    border: "border-red-500/40",
    iconBg: "bg-red-500/20",
    iconColor: "text-red-600",
    label: "Moderation",
    badgeBg: "bg-red-500",
    badgeText: "text-red-600",
  },
  notification: {
    gradient: "from-blue-500/20 to-cyan-500/10",
    border: "border-blue-500/40",
    iconBg: "bg-blue-500/20",
    iconColor: "text-blue-600",
    label: "Notification",
    badgeBg: "bg-blue-500",
    badgeText: "text-blue-600",
  },
};

// Status colors for consistent theming
export interface StatusColorConfig {
  border: string;
  bg: string;
  icon: string;
  badge: string;
  pulse: string;
}

export const statusColors: Record<Exclude<NodeStatus, "initial">, StatusColorConfig> = {
  loading: {
    border: "border-blue-500/60",
    bg: "bg-blue-500/10",
    icon: "text-blue-600",
    badge: "bg-blue-500",
    pulse: "bg-blue-500/30",
  },
  success: {
    border: "border-emerald-500/60",
    bg: "bg-emerald-500/10",
    icon: "text-emerald-600",
    badge: "bg-emerald-500",
    pulse: "bg-emerald-500/30",
  },
  error: {
    border: "border-red-500/60",
    bg: "bg-red-500/10",
    icon: "text-red-600",
    badge: "bg-red-500",
    pulse: "bg-red-500/30",
  },
  skipped: {
    border: "border-muted/60",
    bg: "bg-muted/10",
    icon: "text-muted-foreground",
    badge: "bg-muted",
    pulse: "bg-muted/30",
  },
  pending: {
    border: "border-amber-500/60",
    bg: "bg-amber-500/10",
    icon: "text-amber-600",
    badge: "bg-amber-500",
    pulse: "bg-amber-500/30",
  },
};

// Base node props interface
export interface BaseNodeProps {
  id?: string;
  name: string;
  description?: string;
  category?: NodeCategory;
  status?: NodeStatus;
  icon?: LucideIcon | string;
  children?: React.ReactNode;
  onSettings?: () => void;
  onDelete?: () => void;
  onDoubleClick?: () => void;
  onRetry?: () => void;
}

// Error data structure
export interface NodeErrorData {
  nodeId: string;
  status: NodeStatus;
  error?: {
    message: string;
    code?: string;
    field?: string;
  };
  timestamp?: number;
}

// Format error messages for display
export function formatErrorMessage(error: NodeErrorData["error"]): {
  title: string;
  description: string;
  suggestion?: string;
} {
  if (!error) {
    return {
      title: "Unknown Error",
      description: "An unknown error occurred",
    };
  }

  const { message, code, field } = error;

  const errorPatterns: Record<string, { title: string; suggestion: string }> = {
    missing: {
      title: "Missing Field",
      suggestion: `Please fill in the "${field || "required field"}" before running the workflow.`,
    },
    invalid: {
      title: "Invalid Input",
      suggestion: `The value for "${field || "this field"}" is not valid. Please check and try again.`,
    },
    credential: {
      title: "Authentication Error",
      suggestion: "Please check your credentials and make sure they are still valid.",
    },
    network: {
      title: "Network Error",
      suggestion: "Please check your internet connection and try again.",
    },
    rate_limit: {
      title: "Rate Limited",
      suggestion: "Too many requests. Please wait a moment and try again.",
    },
    permission: {
      title: "Permission Denied",
      suggestion: "You don't have permission to perform this action.",
    },
    not_found: {
      title: "Not Found",
      suggestion: "The requested resource was not found. Please verify the ID or URL.",
    },
    timeout: {
      title: "Request Timeout",
      suggestion: "The request took too long. Please try again.",
    },
  };

  const lowerMessage = message.toLowerCase();

  for (const [pattern, info] of Object.entries(errorPatterns)) {
    if (lowerMessage.includes(pattern)) {
      return {
        title: info.title,
        description: message,
        suggestion: info.suggestion,
      };
    }
  }

  return {
    title: field ? `Error: ${field}` : "Error",
    description: message,
    suggestion: "Please check the configuration and try again.",
  };
}

// Node execution state
export interface NodeExecutionState {
  status: NodeStatus;
  progress?: number;
  error?: NodeErrorData;
  startedAt?: Date;
  completedAt?: Date;
}