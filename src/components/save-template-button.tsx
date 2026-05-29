"use client";

import { useState } from "react";
import { BookmarkIcon, Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SaveTemplateDialog } from "@/components/save-template-dialog";
import { NodeType } from "@prisma/client";

interface SaveTemplateButtonProps {
  nodeType: NodeType;
  currentConfig: Record<string, unknown>;
  variant?: "default" | "outline" | "ghost" | "destructive" | "secondary";
}

export function SaveTemplateButton({
  nodeType,
  currentConfig,
  variant = "outline",
}: SaveTemplateButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2 shrink-0 w-full sm:w-auto"
      >
        <BookmarkIcon className="size-4" />
        Save as Template
      </Button>
      <SaveTemplateDialog
        open={open}
        onOpenChange={setOpen}
        nodeType={nodeType}
        nodeConfig={currentConfig}
      />
    </>
  );
}
