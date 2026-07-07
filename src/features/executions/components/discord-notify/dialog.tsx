import { zodResolver } from "@hookform/resolvers/zod";
import { NodeType } from "@prisma/client";
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
import { Textarea } from "@/components/ui/textarea";
import { SendIcon } from "lucide-react";

const formSchema = z.object({
  webhookUrl: z.string().url("Invalid webhook URL"),
  title: z.string(),
  description: z.string(),
  color: z.string(),
});

export type DiscordNotifyFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (value: DiscordNotifyFormValues) => void;
  defaultValues?: Partial<DiscordNotifyFormValues>;
  nodeId: string;
}

export const DiscordNotifyDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
  nodeId,
}: Props) => {
  const form = useForm<DiscordNotifyFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      webhookUrl: defaultValues.webhookUrl || "",
      title: defaultValues.title || "New YouTube Comment",
      description:
        defaultValues.description ||
        "**Author:** {{YOUTUBE_LIVE_CHAT.raw.authorDetails.displayName}}\n**Comment:** {{YOUTUBE_LIVE_CHAT.snippet.displayMessage}}",
      color: defaultValues.color || "#5865F2",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        webhookUrl: defaultValues.webhookUrl || "",
        title: defaultValues.title || "New YouTube Comment",
        description:
          defaultValues.description ||
          "**Author:** {{YOUTUBE_LIVE_CHAT.raw.authorDetails.displayName}}\n**Comment:** {{YOUTUBE_LIVE_CHAT.snippet.displayMessage}}",
        color: defaultValues.color || "#5865F2",
      });
    }
  }, [open, form, defaultValues]);

  const handleSubmit = (values: DiscordNotifyFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  const handleInsertVariable = (fieldName: "title" | "description", val: string) => {
    const currentVal = form.getValues(fieldName) || "";
    form.setValue(fieldName, currentVal + val, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] overflow-hidden p-0">
        <div className="bg-gradient-to-r from-indigo-500/10 to-transparent p-6 pb-4 border-b border-border/50">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-600 dark:text-indigo-400">
                <SendIcon className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-xl">Discord Notify Settings</DialogTitle>
                <DialogDescription className="mt-1 text-xs">
                  Configure Webhook URL and embed message format to send to Discord.
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
                  Webhook Settings
                </h4>

                <FormField
                  control={form.control}
                  name="webhookUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Discord Webhook URL
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://discord.com/api/webhooks/..."
                          className="font-mono text-xs"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-[11px]">
                        Paste your Discord channel webhook URL here.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4 p-4 rounded-xl border border-border bg-card shadow-sm">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  Message Format
                </h4>

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Embed Title
                      </FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input 
                            placeholder="New Activity Detected" 
                            className="font-mono text-sm"
                            {...field} 
                          />
                        </FormControl>
                        <VariablePicker
                          nodeId={nodeId}
                          onSelect={(val) => handleInsertVariable("title", val)}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Embed Description
                      </FormLabel>
                      <div className="flex gap-2 items-start">
                        <FormControl className="flex-1">
                          <Textarea
                            placeholder="Type your message here..."
                            className="font-mono text-sm min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <VariablePicker
                          nodeId={nodeId}
                          onSelect={(val) => handleInsertVariable("description", val)}
                        />
                      </div>
                      <FormDescription className="text-[11px]">
                        Supports Markdown formatting (e.g. **bold**, *italic*).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Embed Color (Hex)
                      </FormLabel>
                      <FormControl>
                        <div className="flex gap-2 max-w-[200px]">
                          <Input
                            type="color"
                            value={field.value}
                            onChange={field.onChange}
                            className="w-12 p-1 h-9 cursor-pointer"
                          />
                          <Input
                            placeholder="#5865F2"
                            className="font-mono text-sm"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="p-4 rounded-xl border border-border/50 bg-muted/20">
                <NodeOutputHint nodeType={NodeType.DISCORD_NOTIFY} />
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2 pt-2 border-t border-border/40">
                <SaveTemplateButton
                  nodeType={NodeType.DISCORD_NOTIFY}
                  currentConfig={form.getValues()}
                />
                <Button type="submit" className="px-6 font-medium bg-indigo-600 hover:bg-indigo-700 text-white">Save Settings</Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
