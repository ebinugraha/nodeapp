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
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
// Import Variable Picker
import { VariablePicker } from "@/components/variable-picker";

const formSchema = z.object({
  variableName: z
    .string()
    .min(1, { message: "Variable name is required" })
    .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, {
      message:
        "Variable name must start with a letter or underscore and contain only letters, numbers, and underscores",
    })
    .optional(),
  username: z.string().optional(),
  content: z
    .string()
    .min(1, "Message content is required")
    .max(2000, "Discord messages cannot exceed 2000 characters"),
  webhookUrl: z.string().min(1, "webhook URL is required"),
});

export type DiscordFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (value: DiscordFormValues) => void;
  defaultValues?: Partial<DiscordFormValues>;
  nodeId: string; // [BARU] Wajib ada untuk Variable Picker
}

export const DiscordDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
  nodeId, // [BARU] Terima prop nodeId
}: Props) => {
  const form = useForm<DiscordFormValues>({
    defaultValues: {
      variableName: defaultValues.variableName || "",
      username: defaultValues.username || "",
      content: defaultValues.content || "",
      webhookUrl: defaultValues.webhookUrl || "",
    },
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (open === true) {
      form.reset({
        variableName: defaultValues.variableName || "",
        username: defaultValues.username || "",
        content: defaultValues.content || "",
        webhookUrl: defaultValues.webhookUrl || "",
      });
    }
  }, [open, form, defaultValues]);

  const handleSubmit = (values: DiscordFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  // Helper untuk menyisipkan variabel ke field
  const handleInsertVariable = (
    currentValue: string,
    newValue: string,
    onChange: (val: string) => void
  ) => {
    onChange((currentValue || "") + newValue);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Discord Configuration</DialogTitle>
          <DialogDescription>
            Configure settings for the manual HTTP Request Node
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className="w-full space-y-6 mt-4"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            {/* Variable Name (Output) tidak butuh picker */}
            <FormField
              control={form.control}
              name="variableName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Variable Name</FormLabel>
                  <FormControl>
                    <Input placeholder="myDiscord" {...field} />
                  </FormControl>
                  <FormDescription>
                    Use this name to reference the response data in subsequent
                    nodes: {`{{${field.value || "myDiscord"}.text}}`}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Webhook URL */}
            <FormField
              control={form.control}
              name="webhookUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Webhook URL</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input
                        placeholder="https://discord.com/api/webhook"
                        {...field}
                      />
                    </FormControl>
                    {/* Picker untuk URL dinamis */}
                    <VariablePicker
                      nodeId={nodeId}
                      onSelect={(val) =>
                        handleInsertVariable(field.value, val, field.onChange)
                      }
                    />
                  </div>
                  <FormDescription>
                    channel settings {">"} integration {">"} webhooks
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Content (Textarea) */}
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Discord content</FormLabel>
                  <div className="flex gap-2 items-start">
                    <FormControl>
                      <Textarea
                        placeholder="Summary: {{myGemini.text}}"
                        className="min-h-[120px] font-mono text-sm"
                        {...field}
                      />
                    </FormControl>
                    {/* Picker untuk Content */}
                    <VariablePicker
                      nodeId={nodeId}
                      onSelect={(val) =>
                        handleInsertVariable(field.value, val, field.onChange)
                      }
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Username */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bot Username (optional)</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input placeholder="workflow bot" {...field} />
                    </FormControl>
                    {/* Picker untuk Username */}
                    <VariablePicker
                      nodeId={nodeId}
                      onSelect={(val) =>
                        handleInsertVariable(
                          field.value || "",
                          val,
                          field.onChange
                        )
                      }
                    />
                  </div>
                  <FormDescription>
                    Override webhooks default username
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button className="w-full" type="submit">
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
