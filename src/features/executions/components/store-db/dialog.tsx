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
import { SaveTemplateButton } from "@/components/save-template-button";
import { NodeType } from "@prisma/client";

const formSchema = z.object({
  dataMapping: z.string(),
  variableName: z.string(),
});

export type StoreDBFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (value: StoreDBFormValues) => void;
  defaultValues?: Partial<StoreDBFormValues>;
}

export const StoreDBDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const form = useForm<StoreDBFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dataMapping: defaultValues.dataMapping || "author: {{author}}\ncomment: {{comment}}\nvideoId: {{videoId}}",
      variableName: defaultValues.variableName || "storeResult",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        dataMapping: defaultValues.dataMapping || "author: {{author}}\ncomment: {{comment}}\nvideoId: {{videoId}}",
        variableName: defaultValues.variableName || "storeResult",
      });
    }
  }, [open, form, defaultValues]);

  const handleSubmit = (values: StoreDBFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Store to Database Configuration</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 w-full"
          >
            <FormField
              control={form.control}
              name="dataMapping"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data Mapping (one per line)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="author: {{author}}"
                      rows={6}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Format: field_name: {"{{variable}}"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-muted p-3 rounded-lg text-sm">
              <h4 className="font-medium mb-2">Available Variables:</h4>
              <ul className="text-muted-foreground space-y-1">
                <li>• {"{{author}}"} - Comment author</li>
                <li>• {"{{comment}}"} - Comment text</li>
                <li>• {"{{videoId}}"} - Video ID</li>
                <li>• {"{{timestamp}}"} - Current timestamp</li>
              </ul>
            </div>

            <FormField
              control={form.control}
              name="variableName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Output Variable Name</FormLabel>
                  <FormControl>
                    <Input placeholder="storeResult" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <SaveTemplateButton
                nodeType={NodeType.STORE_DB}
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