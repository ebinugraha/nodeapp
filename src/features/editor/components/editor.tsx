"use client";

import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  type Connection,
  Controls,
  type Edge,
  type EdgeChange,
  MiniMap,
  type Node,
  type NodeChange,
  Panel,
  ReactFlow,
} from "@xyflow/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ImperativePanelHandle } from "react-resizable-panels";
import { ErrorView, LoadingView } from "@/components/entity-components";
import { nodeComponents } from "@/config/node-components";
import { useSettings } from "@/features/settings/hooks/use-settings";
import {
  useSuspenseWorkflow,
  useUpdateWorkflow,
} from "@/features/workflows/hooks/use-workflows";
import "@xyflow/react/dist/style.css";
import { NodeType } from "@prisma/client";
import { useSetAtom, useAtomValue } from "jotai";
import { AlertCircle, Check, Loader2, TerminalSquareIcon } from "lucide-react";
import { useTheme } from "next-themes";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { editorAtom, requestSaveAtom } from "../store/atoms";
import { AddNoteButton } from "./add-node-button";
import { ExecutionButton } from "./execution-button";
import { EditorExecutionViewer } from "./editor-execution-viewer";
import { Button } from "@/components/ui/button";

export const EditorLoading = () => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-background">
      <Loader2 className="size-8 animate-spin text-primary" />
      <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading editor...</p>
    </div>
  );
};

export const EditorError = () => {
  return <ErrorView message="Editor error..." />;
};

export const Editor = ({ workflowId }: { workflowId: string }) => {
  const { data: wofkflow } = useSuspenseWorkflow(workflowId);
  const updateWorkflow = useUpdateWorkflow();
  const { settings } = useSettings();
  const { theme } = useTheme();

  const setWorkflow = useSetAtom(editorAtom);
  const reactFlowInstance = useAtomValue(editorAtom);
  const setRequestSave = useSetAtom(requestSaveAtom);

  const [nodes, setNodes] = useState<Node[]>(wofkflow.nodes);
  const [edges, setEdges] = useState<Edge[]>(wofkflow.edges);
  const [positionStatus, setPositionStatus] = useState<
    "saved" | "changed" | "saving"
  >("saved");

  // Get preferences from settings
  const snapToGrid = settings?.snapToGrid ?? true;
  const showMiniMap = settings?.showMiniMap ?? true;
  const compactMode = settings?.compactMode ?? false;

  const isSavingRef = useRef(false);
  const logsPanelRef = useRef<ImperativePanelHandle>(null);
  const [isLogsCollapsed, setIsLogsCollapsed] = useState(false);

  // Core save function
  const saveWorkflow = useCallback(
    async (currentNodes: Node[], currentEdges: Edge[]) => {
      if (isSavingRef.current) return;
      
      const nodesToSave = reactFlowInstance?.getNodes() || currentNodes;
      const edgesToSave = reactFlowInstance?.getEdges() || currentEdges;
      
      isSavingRef.current = true;
      setPositionStatus("saving");

      try {
        await updateWorkflow.mutateAsync({
          id: workflowId,
          nodes: nodesToSave.map((node) => ({
            id: node.id,
            type: node.type || undefined,
            data: node.data || {},
            position: node.position,
          })),
          edges: edgesToSave.map((edge) => ({
            source: edge.source,
            target: edge.target,
            sourceHandle: edge.sourceHandle || undefined,
            targetHandle: edge.targetHandle || undefined,
          })),
        });
        setPositionStatus("saved");
      } catch (error) {
        console.error("Failed to save workflow:", error);
        setPositionStatus("changed");
      } finally {
        isSavingRef.current = false;
      }
    },
    [workflowId, updateWorkflow, reactFlowInstance]
  );

  // Track latest nodes and edges for debounced save
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  
  useEffect(() => {
    nodesRef.current = nodes;
    edgesRef.current = edges;
  }, [nodes, edges]);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const requestSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveWorkflow(nodesRef.current, edgesRef.current);
    }, 300); // 300ms debounce allows React to apply all node and edge state changes
  }, [saveWorkflow]);

  // Expose requestSave globally for child components (like NodeSelector)
  useEffect(() => {
    setRequestSave(() => requestSave);
    return () => setRequestSave(null);
  }, [requestSave, setRequestSave]);

  // Keyboard shortcut for save (Ctrl+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        saveWorkflow(nodesRef.current, edgesRef.current);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [saveWorkflow]);

  // Effect to auto-save when node data (configuration) changes
  const previousDataRef = useRef(nodes.map(n => n.data));
  useEffect(() => {
    const currentData = nodes.map(n => n.data);
    if (JSON.stringify(previousDataRef.current) !== JSON.stringify(currentData)) {
      requestSave();
      previousDataRef.current = currentData;
    }
  }, [nodes, requestSave]);

  const onNodeDragStop = useCallback(
    (_: React.MouseEvent, __: Node, ___: Node[]) => {
      requestSave();
    },
    [requestSave]
  );

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const hasAddOrRemove = changes.some(
        (c) => c.type === "remove" || c.type === "add"
      );
      if (hasAddOrRemove) {
        requestSave();
      }
      setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot));
    },
    [requestSave]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      const hasAddOrRemove = changes.some(
        (c) => c.type === "remove" || c.type === "add"
      );
      if (hasAddOrRemove) {
        requestSave();
      }
      setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot));
    },
    [requestSave]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      requestSave();
      setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot));
    },
    [requestSave]
  );

  const hasManualTrigger = useMemo(() => {
    return nodes.some((node) => node.type === NodeType.MANUAL_TRIGGER);
  }, [nodes]);

  const enhancedEdges = useMemo(() => {
    return edges.map((edge) => {
      if (edge.sourceHandle === "true") {
        return {
          ...edge,
          label: "True",
          animated: true,
          style: { ...edge.style, stroke: "#10b981", strokeWidth: 2 },
          labelStyle: { fill: "#10b981", fontWeight: 700, fontSize: 12 },
          labelBgStyle: {
            fill: "hsl(var(--card))",
            stroke: "hsl(var(--border))",
            strokeWidth: 1,
            fillOpacity: 0.9,
          },
          labelBgPadding: [8, 4] as [number, number],
          labelBgBorderRadius: 4,
        };
      }
      if (edge.sourceHandle === "false") {
        return {
          ...edge,
          label: "False",
          animated: true,
          style: { ...edge.style, stroke: "#ef4444", strokeWidth: 2 },
          labelStyle: { fill: "#ef4444", fontWeight: 700, fontSize: 12 },
          labelBgStyle: {
            fill: "hsl(var(--card))",
            stroke: "hsl(var(--border))",
            strokeWidth: 1,
            fillOpacity: 0.9,
          },
          labelBgPadding: [8, 4] as [number, number],
          labelBgBorderRadius: 4,
        };
      }
      return {
        ...edge,
        animated: true,
        style: { ...edge.style, strokeWidth: 2 },
      };
    });
  }, [edges]);

  return (
    <div className="size-full">
      <ResizablePanelGroup direction="vertical">
        <ResizablePanel defaultSize={70} minSize={30} className="relative">
          <ReactFlow
        nodes={nodes}
        edges={enhancedEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeComponents}
        colorMode={(theme as "light" | "dark" | "system") || "system"}
        fitView
        proOptions={{
          hideAttribution: true,
        }}
        onInit={setWorkflow}
        snapGrid={[10, 10]}
        snapToGrid={snapToGrid}
        panOnScroll
        panOnDrag={!compactMode}
        selectionOnDrag
      >
        <Background />
        <Controls />
        {showMiniMap && <MiniMap />}
        <Panel position="top-right">
          <AddNoteButton />
        </Panel>
        {hasManualTrigger && (
          <Panel position="bottom-center">
            <ExecutionButton workflowId={workflowId} />
          </Panel>
        )}
        {isLogsCollapsed && (
          <Panel position="bottom-right">
            <Button
              size="icon"
              variant="outline"
              onClick={() => logsPanelRef.current?.expand()}
              className="bg-background mr-[210px] mb-2"
              title="Show Logs"
            >
              <TerminalSquareIcon />
            </Button>
          </Panel>
        )}
        {/* Position status indicator */}
        <Panel position="top-left">
          <div className="flex items-center gap-2">
            {positionStatus === "saving" ? (
              <div className="flex items-center gap-2 px-2 py-1 text-xs bg-muted text-muted-foreground rounded-md">
                <Loader2 className="size-3 w-3 animate-spin" />
                <span>Saving...</span>
              </div>
            ) : positionStatus === "changed" ? (
              <div className="flex items-center gap-2 px-2 py-1 text-xs bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 rounded-md">
                <AlertCircle className="size-3 w-3" />
                <span>Unsaved changes</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-2 py-1 text-xs bg-green-500/20 text-green-700 dark:text-green-400 rounded-md">
                <Check className="size-3 w-3" />
                <span>Saved</span>
              </div>
            )}
            {positionStatus === "changed" && (
              <button
                onClick={() => saveWorkflow(nodes, edges)}
                className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Save
              </button>
            )}
          </div>
        </Panel>
      </ReactFlow>
        </ResizablePanel>

        <ResizableHandle withHandle className="bg-border/50" />

        <ResizablePanel
          ref={logsPanelRef}
          defaultSize={30}
          minSize={20}
          collapsible={true}
          collapsedSize={0}
          onCollapse={() => setIsLogsCollapsed(true)}
          onExpand={() => setIsLogsCollapsed(false)}
          className="bg-card"
        >
          <EditorExecutionViewer workflowId={workflowId} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
