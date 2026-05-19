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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import z from "zod";

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
}

export const DiscordNotifyDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const form = useForm<DiscordNotifyFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      webhookUrl: defaultValues.webhookUrl || "",
      title: defaultValues.title || "New YouTube Comment",
      description: defaultValues.description || "**Author:** {{author}}\n**Comment:** {{comment}}",
      color: defaultValues.color || "#FF0000",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        webhookUrl: defaultValues.webhookUrl || "",
        title: defaultValues.title || "New YouTube Comment",
        description: defaultValues.description || "**Author:** {{author}}\n**Comment:** {{comment}}",
        color: defaultValues.color || "#FF0000",
      });
    }
  }, [open, form, defaultValues]);

  const handleSubmit = (values: DiscordNotifyFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Discord Notify Configuration</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 w-full"
          >
            <FormField
              control={form.control}
              name="webhookUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Discord Webhook URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://discord.com/api/webhooks/..." {...field} />
                  </FormControl>
                  <FormDescription>
                    Get this from your Discord channel settings
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Embed Title</FormLabel>
                  <FormControl>
                    <Input placeholder="New YouTube Comment" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Embed Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="**Author:** {{author}}"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Available variables: {"{{author}}"}, {"{{comment}}"}, {"{{videoId}}"}
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
                  <FormLabel>Embed Color (Hex)</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input type="color" value={field.value} onChange={field.onChange} className="w-12" />
                      <Input placeholder="#FF0000" {...field} className="flex-1" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};