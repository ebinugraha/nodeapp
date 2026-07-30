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
    const nodeWidth = 220;
    const nodeHeight = 72;

    minX -= padding;
    minY -= padding;
    maxX += padding + nodeWidth;
    maxY += padding + nodeHeight;

    const width = maxX - minX;
    const height = maxY - minY;

    const viewBox = `${minX} ${minY} ${width} ${height}`;

    const getNodeClasses = (type: string) => {
      if (type.includes("TRIGGER") || type.includes("YOUTUBE") || type === "INTITAL") {
        return { stroke: "stroke-amber-500", fill: "fill-amber-500", lightFill: "fill-amber-500/20" };
      }
      if (type.includes("HTTP_REQUEST") || type.includes("WEBHOOK")) {
        return { stroke: "stroke-emerald-500", fill: "fill-emerald-500", lightFill: "fill-emerald-500/20" };
      }
      if (type === "DECISION" || type === "WAIT_DELAY") {
        return { stroke: "stroke-blue-500", fill: "fill-blue-500", lightFill: "fill-blue-500/20" };
      }
      if (type.includes("GAMBLING_CHECKER")) {
        return { stroke: "stroke-purple-500", fill: "fill-purple-500", lightFill: "fill-purple-500/20" };
      }
      return { stroke: "stroke-slate-500", fill: "fill-slate-500", lightFill: "fill-slate-500/20" };
    };

    const edgesRender = connections?.map((edge) => {
      const source = nodePositions.get(edge.fromNodeId);
      const target = nodePositions.get(edge.toNodeId);

      if (!source || !target) return null;

      const sx = source.x + nodeWidth;
      const sy = source.y + nodeHeight / 2;
      const tx = target.x;
      const ty = target.y + nodeHeight / 2;

      const dx = Math.abs(tx - sx) / 2.5;
      const path = `M ${sx},${sy} C ${sx + dx},${sy} ${tx - dx},${ty} ${tx},${ty}`;

      return (
        <path
          key={edge.id}
          d={path}
          fill="none"
          className="stroke-muted-foreground/30 stroke-[4] transition-all"
        />
      );
    });

    const nodesRender = nodes.map((node) => {
      const pos = nodePositions.get(node.id)!;
      const type = node.type || "";
      const { stroke, fill, lightFill } = getNodeClasses(type);

      return (
        <g key={node.id} filter="url(#drop-shadow)">
          {/* Main Node Body */}
          <rect
            x={pos.x}
            y={pos.y}
            width={nodeWidth}
            height={nodeHeight}
            rx={16}
            className={`fill-card stroke-[3] ${stroke}`}
          />
          {/* Node Icon Placeholder */}
          <rect
            x={pos.x + 16}
            y={pos.y + 16}
            width={40}
            height={40}
            rx={10}
            className={lightFill}
          />
          <circle cx={pos.x + 36} cy={pos.y + 36} r={8} className={fill} />
          
          {/* Node Title Placeholder */}
          <rect
            x={pos.x + 72}
            y={pos.y + 24}
            width={nodeWidth - 100}
            height={12}
            rx={6}
            className="fill-muted-foreground/30"
          />
          {/* Node Subtitle Placeholder */}
          <rect
            x={pos.x + 72}
            y={pos.y + 42}
            width={(nodeWidth - 100) * 0.6}
            height={8}
            rx={4}
            className="fill-muted-foreground/20"
          />
          
          {/* Input Handle (if not trigger) */}
          {!type.includes("TRIGGER") && type !== "INTITAL" && !type.includes("YOUTUBE") && (
            <circle cx={pos.x} cy={pos.y + nodeHeight / 2} r={6} className={`fill-background stroke-[3] ${stroke}`} />
          )}
          {/* Output Handle */}
          <circle cx={pos.x + nodeWidth} cy={pos.y + nodeHeight / 2} r={6} className={`fill-background stroke-[3] ${stroke}`} />
        </g>
      );
    });

    // Render edges first so they appear behind nodes
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
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodOpacity="0.15" />
        </filter>
      </defs>
      {edgesRender}
      {nodesRender}
    </svg>
  );
};
