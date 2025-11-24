"use client";

import { ErrorView, LoadingView } from "@/components/entity-components";
import { nodeComponents } from "@/config/node-components";
import { useSuspenseWorkflow } from "@/features/workflows/hooks/use-workflows";
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
import { useCallback, useMemo, useState } from "react";
import { AddNoteButton } from "./add-node-button";
import { useSetAtom } from "jotai";
import { editorAtom } from "../store/atoms";
import { NodeType } from "@/generated/prisma";
import { ExecutionButton } from "./execution-button";

export const EditorLoading = () => {
  return <LoadingView message="Loading editor..." />;
};

export const EditorError = () => {
  return <ErrorView message="Editor error..." />;
};

export const Editor = ({ workflowId }: { workflowId: string }) => {
  const { data: wofkflow } = useSuspenseWorkflow(workflowId);

  const setWorkflow = useSetAtom(editorAtom);

  const [nodes, setNodes] = useState<Node[]>(wofkflow.nodes);
  const [edges, setEdges] = useState<Edge[]>(wofkflow.edges);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    []
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    []
  );
  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    []
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
        snapToGrid
        panOnScroll
        panOnDrag={false}
        selectionOnDrag
      >
        <Background />
        <Controls />
        <MiniMap />
        <Panel position="top-right">
          <AddNoteButton />
        </Panel>
        {hasManualTrigger && (
          <Panel position="bottom-center">
            <ExecutionButton workflowId={workflowId} />
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
};
