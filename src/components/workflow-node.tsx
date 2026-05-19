"use client";

import { NodeToolbar, Position } from "@xyflow/react";
import { Button } from "./ui/button";
import {
  Settings2Icon,
  Trash2Icon,
  MoreHorizontalIcon,
  GripVerticalIcon,
} from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { cn } from "@/lib/utils";

interface WorkflowNodeProps {
  children: React.ReactNode;
  showToolbar?: boolean;
  onDelete?: () => void;
  onSettings?: () => void;
  name?: string;
  description?: string;
  category?: "trigger" | "action" | "ai" | "logic" | "moderation" | "notification";
  status?: "success" | "error" | "loading" | "initial";
}

const categoryColors = {
  trigger: {
    bg: "from-amber-500/10 to-orange-500/10",
    border: "border-amber-500/30",
    icon: "text-amber-500",
  },
  action: {
    bg: "from-slate-500/10 to-gray-500/10",
    border: "border-slate-500/30",
    icon: "text-slate-500",
  },
  ai: {
    bg: "from-violet-500/10 to-purple-500/10",
    border: "border-violet-500/30",
    icon: "text-violet-500",
  },
  logic: {
    bg: "from-emerald-500/10 to-teal-500/10",
    border: "border-emerald-500/30",
    icon: "text-emerald-500",
  },
  moderation: {
    bg: "from-red-500/10 to-pink-500/10",
    border: "border-red-500/30",
    icon: "text-red-500",
  },
  notification: {
    bg: "from-blue-500/10 to-cyan-500/10",
    border: "border-blue-500/30",
    icon: "text-blue-500",
  },
};

export function WorkflowNode({
  children,
  showToolbar = true,
  onDelete,
  onSettings,
  name,
  description,
  category = "action",
}: WorkflowNodeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const colors = categoryColors[category];

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Floating Toolbar - appears on hover */}
        {showToolbar && (
          <NodeToolbar className="flex items-center gap-1 bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-7 cursor-grab active:cursor-grabbing"
                >
                  <GripVerticalIcon className="size-3.5 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Drag to move</TooltipContent>
            </Tooltip>

            <div className="w-px h-4 bg-border mx-0.5" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" className="size-7" onClick={onSettings}>
                  <Settings2Icon className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Settings</TooltipContent>
            </Tooltip>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="size-7">
                  <MoreHorizontalIcon className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={onSettings} className="gap-2">
                  <Settings2Icon className="size-4" />
                  Configure
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={onDelete}
                  className="gap-2 text-destructive focus:text-destructive"
                >
                  <Trash2Icon className="size-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </NodeToolbar>
        )}

        {/* Main Node Content */}
        {children}

        {/* Bottom Label */}
        {name && (
          <NodeToolbar
            position={Position.Bottom}
            isVisible
            className="bg-transparent shadow-none border-0 p-0"
          >
            <div className={cn(
              "flex flex-col items-center text-center transform -translate-x-1/2 translate-y-2",
              "bg-background/95 backdrop-blur-sm rounded-lg px-3 py-1.5 border shadow-sm"
            )}>
              <p className="text-xs font-semibold">{name}</p>
              {description && (
                <p className="text-[10px] text-muted-foreground truncate max-w-[150px]">
                  {description}
                </p>
              )}
            </div>
          </NodeToolbar>
        )}
      </div>
    </TooltipProvider>
  );
}