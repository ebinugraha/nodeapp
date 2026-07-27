import React, { useMemo } from "react";
import { Node, Connection } from "@prisma/client";
import { WorkflowIcon } from "lucide-react";

export const WorkflowThumbnail = ({
  nodes,
  connections,
}: {
  nodes?: Node[];
  connections?: Connection[];
}) => {
  const { viewBox, nodesRender, edgesRender } = useMemo(() => {
    if (!nodes || nodes.length === 0) {
      return { viewBox: "0 0 100 100", nodesRender: null, edgesRender: null };
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    const nodePositions = new Map<string, { x: number; y: number }>();

    nodes.forEach((node) => {
      const pos = node.position as { x: number; y: number };
      const x = Number(pos?.x) || 0;
      const y = Number(pos?.y) || 0;
      
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;

      nodePositions.set(node.id, { x, y });
    });

    const padding = 120;
    const nodeWidth = 200;
    const nodeHeight = 60;

    minX -= padding;
    minY -= padding;
    maxX += padding + nodeWidth;
    maxY += padding + nodeHeight;

    const width = maxX - minX;
    const height = maxY - minY;

    const viewBox = `${minX} ${minY} ${width} ${height}`;

    const nodesRender = nodes.map((node) => {
      const pos = nodePositions.get(node.id)!;
      const isInitial = node.type === "INTITAL";

      return (
        <g key={node.id} filter="url(#drop-shadow)">
          {/* Main Node Body */}
          <rect
            x={pos.x}
            y={pos.y}
            width={nodeWidth}
            height={nodeHeight}
            rx={12}
            className={`fill-background stroke-[4] ${isInitial ? "stroke-primary" : "stroke-primary/40"}`}
          />
          {/* Node Icon Placeholder */}
          <rect
            x={pos.x + 12}
            y={pos.y + 14}
            width={32}
            height={32}
            rx={8}
            className={isInitial ? "fill-primary" : "fill-primary/20"}
          />
          {/* Node Title Placeholder */}
          <rect
            x={pos.x + 56}
            y={pos.y + 20}
            width={nodeWidth - 76}
            height={10}
            rx={5}
            className="fill-foreground/80"
          />
          {/* Node Subtitle Placeholder */}
          <rect
            x={pos.x + 56}
            y={pos.y + 36}
            width={(nodeWidth - 76) * 0.6}
            height={8}
            rx={4}
            className="fill-muted-foreground/40"
          />
        </g>
      );
    });

    const edgesRender = connections?.map((edge) => {
      const source = nodePositions.get(edge.fromNodeId);
      const target = nodePositions.get(edge.toNodeId);

      if (!source || !target) return null;

      const sx = source.x + nodeWidth;
      const sy = source.y + nodeHeight / 2;
      const tx = target.x;
      const ty = target.y + nodeHeight / 2;

      const dx = Math.abs(tx - sx) / 2;
      const path = `M ${sx},${sy} C ${sx + dx},${sy} ${tx - dx},${ty} ${tx},${ty}`;

      return (
        <path
          key={edge.id}
          d={path}
          fill="none"
          className="stroke-primary/60 stroke-[6]"
        />
      );
    });

    return { viewBox, nodesRender, edgesRender };
  }, [nodes, connections]);

  if (!nodes || nodes.length === 0) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <WorkflowIcon className="size-10 text-primary/40" />
      </div>
    );
  }

  return (
    <svg
      viewBox={viewBox}
      className="absolute inset-0 w-full h-full opacity-100"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <filter id="drop-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.1" />
        </filter>
      </defs>
      {edgesRender}
      {nodesRender}
    </svg>
  );
};
