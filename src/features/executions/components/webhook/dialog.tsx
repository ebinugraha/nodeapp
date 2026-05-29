import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import z from "zod";
import { SaveTemplateButton } from "@/components/save-template-button";
import { NodeType } from "@prisma/client";

const formSchema = z.object({
  url: z.string().url("Invalid URL"),
  method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"]),
  headers: z.string(),
  bodyTemplate: z.string(),
  variableName: z.string(),
});

export type WebhookFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (value: WebhookFormValues) => void;
  defaultValues?: Partial<WebhookFormValues>;
}

export const WebhookDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const form = useForm<WebhookFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: defaultValues.url || "",
      method: defaultValues.method || "POST",
      headers: defaultValues.headers || "Content-Type: application/json",
      bodyTemplate: defaultValues.bodyTemplate || '{"author": "{{author}}", "comment": "{{comment}}"}',
      variableName: defaultValues.variableName || "webhookResult",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        url: defaultValues.url || "",
        method: defaultValues.method || "POST",
        headers: defaultValues.headers || "Content-Type: application/json",
        bodyTemplate: defaultValues.bodyTemplate || '{"author": "{{author}}", "comment": "{{comment}}"}',
        variableName: defaultValues.variableName || "webhookResult",
      });
    }
  }, [open, form, defaultValues]);

  const handleSubmit = (values: WebhookFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Webhook Configuration</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 w-full"
          >
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Webhook URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/webhook" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>HTTP Method</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                      <SelectItem value="PATCH">PATCH</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="headers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Headers (one per line)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Content-Type: application/json"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Format: Header-Name: value
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bodyTemplate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Body Template</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='{"author": "{{author}}"}'
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Available: {"{{author}}"}, {"{{comment}}"}, {"{{videoId}}"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="variableName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Output Variable Name</FormLabel>
                  <FormControl>
                    <Input placeholder="webhookResult" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <SaveTemplateButton
                nodeType={NodeType.WEBHOOK}
                currentConfig={form.getValues()}
              />
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};