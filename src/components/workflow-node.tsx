"use client";

import { NodeToolbar, Position } from "@xyflow/react";
import {
  GripVerticalIcon,
  MoreHorizontalIcon,
  Settings2Icon,
  Trash2Icon,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { categoryConfig, type NodeCategory } from "@/types/node";
import { Button } from "./ui/button";
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
        {/* Action Buttons Toolbar - always visible below the node */}
        {showToolbar && (
          <NodeToolbar
            position={Position.Bottom}
            isVisible={true}
            className="flex items-center gap-4 bg-transparent shadow-none border-0 p-0 transform translate-y-2"
          >
            <Button
              size="icon"
              className="size-6 rounded-full bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-sm border border-slate-200/60 pointer-events-auto transition-all"
              onClick={onSettings}
            >
              <Settings2Icon className="size-3" />
            </Button>

            <Button
              size="icon"
              className="size-6 rounded-full bg-white text-slate-700 hover:bg-red-500 hover:text-white shadow-sm border border-slate-200/60 transition-all pointer-events-auto"
              onClick={onDelete}
            >
              <Trash2Icon className="size-3" />
            </Button>
          </NodeToolbar>
        )}

        {/* Main Node Content */}
        {children}

      </div>
    </TooltipProvider>
  );
}
