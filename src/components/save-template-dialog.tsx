"use client";

import { Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateTemplate } from "@/features/templates/hooks/use-templates";
import { NodeType } from "@prisma/client";
import { useState } from "react";

interface SaveTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodeType: NodeType;
  nodeConfig: Record<string, unknown>;
}

export function SaveTemplateDialog({
  open,
  onOpenChange,
  nodeType,
  nodeConfig,
}: SaveTemplateDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const createTemplate = useCreateTemplate();

  const handleSubmit = async () => {
    if (!name.trim()) return;

    createTemplate.mutate({
      name: name.trim(),
      description: description.trim() || undefined,
      nodeType,
      config: nodeConfig,
    });

    onOpenChange(false);
    setName("");
    setDescription("");
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setName("");
      setDescription("");
    }
    onOpenChange(newOpen);
  };

  const isLoading = createTemplate.isPending;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save as Template</DialogTitle>
          <DialogDescription>
            Save this node configuration as a reusable template
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Template Name</label>
            <Input
              placeholder="e.g., Spam Detection Config"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description (optional)</label>
            <Textarea
              placeholder="Describe when to use this template..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Node Type</p>
            <p className="text-sm font-medium">{nodeType}</p>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || isLoading}
          >
            {isLoading && <Loader2Icon className="size-4 animate-spin mr-2" />}
            Save Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
