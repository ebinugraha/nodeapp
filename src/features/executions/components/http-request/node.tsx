"use client";

import { Node, NodeProps } from "@xyflow/react";
import { memo } from "react";
import { BaseExecutionNode } from "../base-execution-node";
import { GlobeIcon } from "lucide-react";

type HttpRequestNodeData = {
  endpoint?: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: string;
  [key: string]: unknown;
};

type HttpRequestNodeyType = Node<HttpRequestNodeData>;

export const HttpRequestNode = memo(
  (props: NodeProps<HttpRequestNodeyType>) => {
    const nodeData = props.data as HttpRequestNodeData;
    const description = nodeData?.endpoint
      ? `${nodeData || "GET"} : ${nodeData.endpoint}`
      : "Not configured";

    return (
      <>
        <BaseExecutionNode
          {...props}
          id={props.id}
          Icon={GlobeIcon}
          name="HTTP Request"
          description={description}
          onSettings={() => {}}
          onDoubleClick={() => {}}
        />
      </>
    );
  }
);

HttpRequestNode.displayName = "HttpRequetNode";
