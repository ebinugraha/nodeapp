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
import { categoryConfig, type NodeCategory } from "@/types/node";

interface WorkflowNodeProps {
  children: React.ReactNode;
  showToolbar?: boolean;
  onDelete?: () => void;
  onSettings?: () => void;
  name?: string;
  description?: string;
  category?: NodeCategory;
}

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
  const config = categoryConfig[category];

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
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-7"
                  onClick={onSettings}
                >
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
            <div
              className={cn(
                "flex flex-col items-center text-center transform -translate-x-1/2 translate-y-2",
                "bg-background/95 backdrop-blur-sm rounded-lg px-3 py-1.5 border shadow-sm",
              )}
            >
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