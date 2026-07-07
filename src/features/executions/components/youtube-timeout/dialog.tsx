import { zodResolver } from "@hookform/resolvers/zod";
import { CredentialType, NodeType } from "@prisma/client";
import Image from "next/image";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { NodeOutputHint } from "@/components/node-output-hint";
import { SaveTemplateButton } from "@/components/save-template-button";
import { VariablePicker } from "@/components/variable-picker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCredentialsByType } from "@/features/credentials/hooks/use-credentials";
import { ClockIcon } from "lucide-react";

const formSchema = z.object({
  credentialId: z.string().min(1, "Credential is required"),
  durationSeconds: z.number().min(60).max(604800),
  reason: z.string(),
  variableName: z.string(),
});

export type YouTubeTimeoutFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (value: YouTubeTimeoutFormValues) => void;
  defaultValues?: Partial<YouTubeTimeoutFormValues>;
  nodeId: string;
}

export const YouTubeTimeoutDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
  nodeId,
}: Props) => {
  const { data: credentials } = useCredentialsByType(CredentialType.YOUTUBE);

  const form = useForm<YouTubeTimeoutFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      credentialId: defaultValues.credentialId || "",
      durationSeconds: defaultValues.durationSeconds || 300,
      reason: defaultValues.reason || "Violation of community guidelines",
      variableName: defaultValues.variableName || "timeoutResult",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        credentialId: defaultValues.credentialId || "",
        durationSeconds: defaultValues.durationSeconds || 300,
        reason: defaultValues.reason || "Violation of community guidelines",
        variableName: defaultValues.variableName || "timeoutResult",
      });
    }
  }, [open, form, defaultValues]);

  const handleSubmit = (values: YouTubeTimeoutFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  const handleInsertVariable = (val: string) => {
    const currentVal = form.getValues("reason") || "";
    form.setValue("reason", currentVal + val, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds} seconds`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours`;
    return `${Math.floor(seconds / 86400)} days`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] overflow-hidden p-0">
        <div className="bg-gradient-to-r from-orange-500/10 to-transparent p-6 pb-4 border-b border-border/50">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 rounded-lg text-orange-600 dark:text-orange-400">
                <ClockIcon className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-xl">Timeout User Settings</DialogTitle>
                <DialogDescription className="mt-1 text-xs">
                  Configure YouTube user timeout duration and provide a reason.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              <div className="space-y-4 p-4 rounded-xl border border-border bg-card shadow-sm">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  Action Settings
                </h4>

                <FormField
                  control={form.control}
                  name="credentialId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        YouTube OAuth Credential
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select credential" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {credentials?.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              <div className="flex items-center gap-2">
                                <Image
                                  src={"/logos/youtube.svg"}
                                  alt="YouTube Logo"
                                  width={16}
                                  height={16}
                                />
                                <span className="font-medium">{c.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="durationSeconds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex justify-between">
                        <span>Timeout Duration</span>
                        <span className="text-primary normal-case font-normal">{formatDuration(field.value)}</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={60}
                          max={604800}
                          className="font-mono text-sm"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 300)
                          }
                        />
                      </FormControl>
                      <FormDescription className="text-[11px]">
                        Must be between 60 seconds and 7 days (604,800 seconds).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Reason
                      </FormLabel>
                      <div className="flex gap-2 items-start">
                        <FormControl className="flex-1">
                          <Textarea
                            placeholder="Violation of community guidelines"
                            className="font-mono text-sm min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <VariablePicker
                          nodeId={nodeId}
                          onSelect={handleInsertVariable}
                        />
                      </div>
                      <FormDescription className="text-[11px]">
                        Reason shown to the user (optional).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="p-4 rounded-xl border border-border/50 bg-muted/20 space-y-4">
                <FormField
                  control={form.control}
                  name="variableName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        Output Variable Name
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="timeoutResult" 
                          className="font-mono text-sm max-w-sm"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <NodeOutputHint nodeType={NodeType.YOUTUBE_TIMEOUT} />
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2 pt-2 border-t border-border/40">
                <SaveTemplateButton
                  nodeType={NodeType.YOUTUBE_TIMEOUT}
                  currentConfig={form.getValues()}
                />
                <Button type="submit" className="px-6 font-medium">Save Settings</Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
