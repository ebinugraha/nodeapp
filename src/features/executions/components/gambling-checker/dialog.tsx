"use client";

import { NodeType } from "@prisma/client";
import { useForm } from "react-hook-form";
import { NodeOutputHint } from "@/components/node-output-hint";
import { VariablePicker } from "@/components/variable-picker";
import { SaveTemplateButton } from "@/components/save-template-button";
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
import { Label } from "@/components/ui/label";
import { Dice5Icon } from "lucide-react";

type GamblingCheckerFormValues = {
  textToCheck: string;
  variableName: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: Record<string, unknown>) => void;
  defaultValues?: Record<string, unknown>;
  nodeId: string;
};

export const GamblingCheckerDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  nodeId,
}: Props) => {
  const form = useForm<GamblingCheckerFormValues>({
    defaultValues: {
      textToCheck:
        (defaultValues?.textToCheck as string) ||
        "{{YOUTUBE_LIVE_CHAT.snippet.displayMessage}}",
      variableName: (defaultValues?.variableName as string) || "gamblingResult",
    },
  });

  const handleSubmit = form.handleSubmit((values) => {
    onSubmit(values as Record<string, unknown>);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] overflow-hidden p-0">
        <div className="bg-gradient-to-r from-red-500/10 to-transparent p-6 pb-4 border-b border-border/50">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-lg text-red-600 dark:text-red-400">
                <Dice5Icon className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-xl">Gambling Checker Settings</DialogTitle>
                <DialogDescription className="mt-1 text-xs">
                  Configure the online gambling detection node. This will send a POST
                  request to the Hugging Face AI model.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4 p-4 rounded-xl border border-border bg-card shadow-sm">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                Detection Settings
              </h4>
              
              <div className="space-y-2">
                <Label htmlFor="textToCheck" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Text to Check
                </Label>
                <div className="flex gap-2 items-start">
                  <Input
                    id="textToCheck"
                    className="flex-1 font-mono text-sm"
                    placeholder="{{YOUTUBE_LIVE_CHAT.snippet.displayMessage}}"
                    {...form.register("textToCheck")}
                  />
                  <VariablePicker
                    nodeId={nodeId}
                    onSelect={(val) => {
                      const currentVal = form.getValues("textToCheck") || "";
                      form.setValue("textToCheck", currentVal + val);
                    }}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Supports Handlebars variables. Example:{" "}
                  <code className="text-primary bg-primary/10 px-1 py-0.5 rounded">{"{{YOUTUBE_LIVE_CHAT.snippet.displayMessage}}"}</code>
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border/50 bg-muted/20 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="variableName" className="flex items-center gap-2">
                  Output Variable Name
                </Label>
                <Input
                  id="variableName"
                  className="font-mono text-sm max-w-sm"
                  placeholder="gamblingResult"
                  {...form.register("variableName")}
                />
                <p className="text-[11px] text-muted-foreground">
                  The variable name to store the prediction result (e.g. <code className="text-emerald-500 bg-emerald-500/10 px-1 py-0.5 rounded">gamblingResult.isGambling</code>).
                </p>
              </div>
              
              <NodeOutputHint nodeType={NodeType.GAMBLING_CHECKER} />
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2 pt-2 border-t border-border/40">
              <SaveTemplateButton
                nodeType={NodeType.GAMBLING_CHECKER}
                currentConfig={form.getValues()}
              />
              <Button type="submit" className="px-6 font-medium">Save Logic</Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
