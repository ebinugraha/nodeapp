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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import z from "zod";

const formSchema = z.object({
  minConfidence: z.number().min(0).max(1),
  variableName: z.string(),
});

export type SentimentFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (value: SentimentFormValues) => void;
  defaultValues?: Partial<SentimentFormValues>;
}

export const SentimentDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const form = useForm<SentimentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      minConfidence: defaultValues.minConfidence || 0.5,
      variableName: defaultValues.variableName || "sentimentResult",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        minConfidence: defaultValues.minConfidence || 0.5,
        variableName: defaultValues.variableName || "sentimentResult",
      });
    }
  }, [open, form, defaultValues]);

  const handleSubmit = (values: SentimentFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Sentiment Analysis Configuration</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 w-full"
          >
            <FormField
              control={form.control}
              name="minConfidence"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Confidence ({Math.round(field.value * 100)}%)</FormLabel>
                  <FormControl>
                    <Input
                      type="range"
                      min={0}
                      max={1}
                      step={0.1}
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Minimum confidence level for sentiment classification
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
                    <Input placeholder="sentimentResult" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-muted p-4 rounded-lg">
              <h4 className="text-sm font-medium mb-2">Output Fields:</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• <code>label</code>: "positive" | "negative" | "neutral"</li>
                <li>• <code>score</code>: -1 to 1</li>
                <li>• <code>confidence</code>: 0 to 1</li>
                <li>• <code>emotions</code>: {`{joy, anger, sadness, surprise}`}</li>
              </ul>
            </div>

            <DialogFooter>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};