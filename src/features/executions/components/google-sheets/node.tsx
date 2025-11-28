"use client";

import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { BaseExecutionNode } from "../base-execution-node";
import { GoogleSheetsDialog, GoogleSheetsFormValues } from "./dialog";
import { useNodeStatus } from "../../hooks/use-node-status";
import { googleSheetsChannel } from "@/inngest/channels/google-sheets";
import { fetchGoogleSheetsToken } from "./actions";

// Reuse icon file.svg or add new sheets.svg
import { FileSpreadsheetIcon } from "lucide-react";

type GoogleSheetsNodeData = GoogleSheetsFormValues;
type GoogleSheetsNodeType = Node<GoogleSheetsNodeData>;

export const GoogleSheetsNode = memo(
  (props: NodeProps<GoogleSheetsNodeType>) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { setNodes } = useReactFlow();

    const status = useNodeStatus({
      nodeId: props.id,
      channel: googleSheetsChannel().name,
      topic: "status",
      refreshToken: fetchGoogleSheetsToken,
    });

    const data = props.data;
    const description = data.operation
      ? `${data.operation.toUpperCase()}: ${data.range || ""}`
      : "Not configured";

    const onSubmit = (values: GoogleSheetsFormValues) => {
      setNodes((nodes) =>
        nodes.map((node) => {
          if (node.id === props.id) {
            return {
              ...node,
              data: { ...node.data, ...values },
            };
          }
          return node;
        })
      );
    };

    return (
      <>
        <GoogleSheetsDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSubmit={onSubmit}
          defaultValues={data}
        />
        <BaseExecutionNode
          {...props}
          Icon={"/logos/google-sheet.svg"} // Ganti dengan path icon jika sudah ada di public/logos/sheets.svg
          status={status}
          name="Google Sheets"
          description={description}
          onSettings={() => setIsDialogOpen(true)}
          onDoubleClick={() => setIsDialogOpen(true)}
        />
      </>
    );
  }
);

GoogleSheetsNode.displayName = "GoogleSheetsNode";
