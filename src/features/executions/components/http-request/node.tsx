"use client";

import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node";
import { GlobeIcon } from "lucide-react";
import { HTTPRequestDialog, HttpRequestFormValues } from "./dialog";
import { useNodeStatus } from "../../hooks/use-node-status";
import { httpRequestChannel } from "@/inngest/channels/http-request";
import { fetchHttpRequestToken } from "./actions";

type HttpRequestNodeData = {
  variableName?: string;
  endPoint?: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: string;
};

type HttpRequestNodeyType = Node<HttpRequestNodeData>;

export const HttpRequestNode = memo(
  (props: NodeProps<HttpRequestNodeyType>) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const handleSetting = () => {
      setIsDialogOpen(true);
    };

    const status = useNodeStatus({
      nodeId: props.id,
      channel: httpRequestChannel().name,
      topic: "status",
      refreshToken: fetchHttpRequestToken,
    });

    const nodeData = props.data;
    const description = nodeData?.endPoint
      ? `${nodeData.method || "GET"} : ${nodeData.endPoint}`
      : "Not configured";

    const onSubmit = (values: HttpRequestFormValues) => {
      setNodes((nodes) =>
        nodes.map((node) => {
          if (node.id === props.id) {
            return {
              ...node,
              data: {
                variableName: values.variableName,
                endPoint: values.endPoint,
                method: values.method,
                body: values.body,
              },
            };
          }
          return node;
        })
      );
    };

    return (
      <>
        <HTTPRequestDialog
          onSubmit={onSubmit}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          defaultValues={nodeData}
        />
        <BaseExecutionNode
          {...props}
          id={props.id}
          Icon={GlobeIcon}
          status={status}
          name="HTTP Request"
          description={description}
          onSettings={handleSetting}
          onDoubleClick={handleSetting}
        />
      </>
    );
  }
);

HttpRequestNode.displayName = "HttpRequetNode";
