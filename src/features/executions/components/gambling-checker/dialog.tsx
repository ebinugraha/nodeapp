"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { NodeType } from "@prisma/client";
import { NodeOutputHint } from "@/components/node-output-hint";

type GamblingCheckerFormValues = {
  textToCheck: string;
  variableName: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: Record<string, unknown>) => void;
  defaultValues?: Record<string, unknown>;
};

export const GamblingCheckerDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
}: Props) => {
  const form = useForm<GamblingCheckerFormValues>({
    defaultValues: {
      textToCheck: (defaultValues?.textToCheck as string) || "{{youtubeLiveChat.snippet.displayMessage}}",
      variableName: (defaultValues?.variableName as string) || "gamblingResult",
    },
  });

  const handleSubmit = form.handleSubmit((values) => {
    onSubmit(values as Record<string, unknown>);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Gambling Checker Settings</DialogTitle>
          <DialogDescription>
            Configure the online gambling detection node. This will send a POST request to the Hugging Face AI model.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="textToCheck">Text to Check</Label>
            <Input
              id="textToCheck"
              placeholder="{{youtubeLiveChat.snippet.displayMessage}}"
              {...form.register("textToCheck")}
            />
            <p className="text-xs text-muted-foreground">
              Supports Handlebars variables. Example: {"{{youtubeLiveChat.snippet.displayMessage}}"}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="variableName">Output Variable Name</Label>
            <Input
              id="variableName"
              placeholder="gamblingResult"
              {...form.register("variableName")}
            />
            <p className="text-xs text-muted-foreground">
              The variable name to store the prediction result.
            </p>
          </div>

          <NodeOutputHint nodeType={NodeType.GAMBLING_CHECKER} />

          <DialogFooter className="pt-4">
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
