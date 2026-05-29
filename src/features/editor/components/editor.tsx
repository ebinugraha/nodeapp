"use client";

import { useCallback, useMemo, useState, useRef, useEffect } from "react";
import { ErrorView, LoadingView } from "@/components/entity-components";
import { nodeComponents } from "@/config/node-components";
import { useSuspenseWorkflow } from "@/features/workflows/hooks/use-workflows";
import { useUpdateWorkflow } from "@/features/workflows/hooks/use-workflows";
import { useSettings } from "@/features/settings/hooks/use-settings";
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
  Background,
  Controls,
  MiniMap,
  Panel,
} from "@xyflow/react";
// @ts-ignore: side-effect CSS import without type declarations
import "@xyflow/react/dist/style.css";
import { useSetAtom } from "jotai";
import { editorAtom } from "../store/atoms";
import { NodeType } from "@prisma/client";
import { ExecutionButton } from "./execution-button";
import { AddNoteButton } from "./add-node-button";
import { Check, AlertCircle, Loader2 } from "lucide-react";

export const EditorLoading = () => {
  return <LoadingView message="Loading editor..." />;
};

export const EditorError = () => {
  return <ErrorView message="Editor error..." />;
};

export const Editor = ({ workflowId }: { workflowId: string }) => {
  const { data: wofkflow } = useSuspenseWorkflow(workflowId);
  const updateWorkflow = useUpdateWorkflow();
  const { settings } = useSettings();

  const setWorkflow = useSetAtom(editorAtom);

  const [nodes, setNodes] = useState<Node[]>(wofkflow.nodes);
  const [edges, setEdges] = useState<Edge[]>(wofkflow.edges);
  const [positionStatus, setPositionStatus] = useState<"saved" | "changed" | "saving">("saved");

  // Get preferences from settings
  const snapToGrid = settings?.snapToGrid ?? true;
  const showMiniMap = settings?.showMiniMap ?? true;
  const compactMode = settings?.compactMode ?? false;

  // Refs for tracking position state
  const lastSavedPositionsRef = useRef<Record<string, { x: number; y: number }>>({});
  const isSavingRef = useRef(false);

  // Initialize last saved positions on mount
  useEffect(() => {
    const positions: Record<string, { x: number; y: number }> = {};
    wofkflow.nodes.forEach((node) => {
      positions[node.id] = node.position;
    });
    lastSavedPositionsRef.current = positions;
    setPositionStatus("saved");
  }, [wofkflow.nodes]);

  // Check if there are position changes
  const checkPositionChanges = useCallback(() => {
    const currentPositions: Record<string, { x: number; y: number }> = {};
    nodes.forEach((node) => {
      currentPositions[node.id] = node.position;
    });

    // Compare positions
    let hasChanges = false;
    const currentIds = Object.keys(currentPositions);
    const savedIds = Object.keys(lastSavedPositionsRef.current);

    if (currentIds.length !== savedIds.length) {
      hasChanges = true;
    } else {
      for (const id of currentIds) {
        const current = currentPositions[id];
        const saved = lastSavedPositionsRef.current[id];
        if (!saved || current.x !== saved.x || current.y !== saved.y) {
          hasChanges = true;
          break;
        }
      }
    }

    setPositionStatus(hasChanges ? "changed" : "saved");
    return hasChanges;
  }, [nodes]);

  // Save workflow function
  const handleSave = useCallback(async () => {
    if (isSavingRef.current) return;
    if (positionStatus === "saved") return;

    isSavingRef.current = true;
    setPositionStatus("saving");

    try {
      await updateWorkflow.mutateAsync({
        id: workflowId,
        nodes: nodes.map((node) => ({
          id: node.id,
          type: node.type || undefined,
          data: node.data || {},
          position: node.position,
        })),
        edges: edges.map((edge) => ({
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle || undefined,
          targetHandle: edge.targetHandle || undefined,
        })),
      });

      // Update last saved positions
      const positions: Record<string, { x: number; y: number }> = {};
      nodes.forEach((node) => {
        positions[node.id] = node.position;
      });
      lastSavedPositionsRef.current = positions;
      setPositionStatus("saved");
    } catch (error) {
      console.error("Failed to save workflow:", error);
      setPositionStatus("changed");
    } finally {
      isSavingRef.current = false;
    }
  }, [workflowId, nodes, edges, updateWorkflow, positionStatus]);

  // Keyboard shortcut for save (Ctrl+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave]);

  // Node change handler - track position changes
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nodesSnapshot) => {
        const newNodes = applyNodeChanges(changes, nodesSnapshot);
        // Check for position changes after state update
        setTimeout(checkPositionChanges, 0);
        return newNodes;
      });
    },
    [checkPositionChanges],
  );

  // Edge change handler - don't trigger for edges
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot));
    },
    [],
  );

  // Connection handler - don't trigger for connections
  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot));
    },
    [],
  );

  const hasManualTrigger = useMemo(() => {
    return nodes.some((node) => node.type === NodeType.MANUAL_TRIGGER);
  }, [nodes]);

  return (
    <div className="size-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeComponents}
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
            {/* Save button */}
            {positionStatus === "changed" && (
              <button
                onClick={handleSave}
                className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Save
              </button>
            )}
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};