import React, { useState } from "react";
import { formatDuration } from "date-fns";
import { CheckCircle2Icon, AlertCircleIcon, ChevronRightIcon, ClockIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { cn } from "@/lib/utils";
import type { NodeType } from "@prisma/client";

interface ExecutionLog {
  nodeId: string;
  nodeName: string;
  type: NodeType;
  duration: number;
  status: "SUCCESS" | "FAILED";
  output: any;
  error?: string;
}

interface ExecutionLogViewerProps {
  logs: ExecutionLog[];
}

export const ExecutionLogViewer = ({ logs }: ExecutionLogViewerProps) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(
    logs.length > 0 ? logs[0].nodeId : null
  );

  const selectedLog = logs.find((l) => l.nodeId === selectedNodeId);

  return (
    <ResizablePanelGroup direction="horizontal" className="size-full bg-card overflow-hidden">
      {/* Sidebar: Logs List */}
      <ResizablePanel defaultSize={30} minSize={20} className="border-r border-border bg-muted/20 flex flex-col">
        <div className="px-2 py-1.5 border-b border-border/50 bg-muted/40">
          <h3 className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">
            LOGS
          </h3>
        </div>
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            <div className="flex flex-col">
            {logs.map((log) => {
              const Icon = CheckCircle2Icon;
              const isSelected = selectedNodeId === log.nodeId;

              return (
                <button
                  key={log.nodeId}
                  onClick={() => setSelectedNodeId(log.nodeId)}
                  className={cn(
                    "flex items-center gap-2 px-2 py-1.5 text-left transition-colors border-b border-border/40 relative",
                    isSelected
                      ? "bg-primary/5 hover:bg-primary/5"
                      : "hover:bg-muted/50"
                  )}
                >
                  {isSelected && (
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary" />
                  )}
                  
                  <div className={cn(
                    "flex items-center justify-center size-5 rounded-md shrink-0",
                    log.status === "FAILED" ? "bg-destructive/10 text-destructive" :
                    isSelected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  )}>
                    <Icon className="size-[10px]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-[11px] font-medium truncate leading-none",
                      isSelected ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {log.nodeName}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      {log.status === "FAILED" ? (
                        <AlertCircleIcon className="size-2.5 text-destructive" />
                      ) : (
                        <CheckCircle2Icon className="size-2.5 text-emerald-500" />
                      )}
                      <span className="text-[9px] text-muted-foreground font-mono leading-none">
                        {log.duration < 1000 
                          ? `${log.duration}ms` 
                          : `${(log.duration / 1000).toFixed(1)}s`}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
            </div>
          </ScrollArea>
        </div>
      </ResizablePanel>

      <ResizableHandle withHandle className="bg-border/50" />

      {/* Main Content: Output View */}
      <ResizablePanel defaultSize={70} minSize={30} className="flex flex-col bg-background/50">
        <div className="px-3 py-1.5 border-b border-border/50 bg-muted/20 flex items-center justify-between">
          <h3 className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">
            OUTPUT
          </h3>
          {selectedLog && (
            <Badge variant={selectedLog.status === "FAILED" ? "destructive" : "secondary"} className="text-[10px] font-mono">
              {selectedLog.duration}ms
            </Badge>
          )}
        </div>
        
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            <div className="p-2">
              {selectedLog ? (
                <div className="space-y-2">
                  {selectedLog.status === "FAILED" && selectedLog.error && (
                    <div className="p-2 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-[11px] font-mono whitespace-pre-wrap">
                      {selectedLog.error}
                    </div>
                  )}
                  
                  <div className="rounded-md overflow-hidden border border-border/50 bg-[#1e1e1e]">
                    <div className="flex items-center px-2 py-1 border-b border-white/10 bg-black/20">
                      <span className="text-[9px] font-mono text-white/50">JSON</span>
                    </div>
                    <div className="p-2 overflow-x-auto">
                      <pre className="text-[11px] font-mono leading-relaxed text-[#d4d4d4]">
                        {JSON.stringify(selectedLog.output, null, 2) || "{}"}
                      </pre>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <p className="text-[11px]">Select a node to view its output</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
