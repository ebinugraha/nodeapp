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
import { VariablePicker } from "@/components/variable-picker";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import z from "zod";
import { SaveTemplateButton } from "@/components/save-template-button";
import { NodeType } from "@prisma/client";

const formSchema = z.object({
  minConfidence: z.number().min(0).max(1),
  variableName: z.string(),
  textToAnalyze: z.string().min(1, "Text to analyze is required"),
});

export type SentimentFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (value: SentimentFormValues) => void;
  defaultValues?: Partial<SentimentFormValues>;
  nodeId: string;
}

export const SentimentDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
  nodeId,
}: Props) => {
  const form = useForm<SentimentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      minConfidence: defaultValues.minConfidence || 0.5,
      variableName: defaultValues.variableName || "sentimentResult",
      textToAnalyze: defaultValues.textToAnalyze || "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        minConfidence: defaultValues.minConfidence || 0.5,
        variableName: defaultValues.variableName || "sentimentResult",
        textToAnalyze: defaultValues.textToAnalyze || "",
      });
    }
  }, [open, form, defaultValues]);

  const handleSubmit = (values: SentimentFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  const handleInsertVariable = (
    currentValue: string,
    newValue: string,
    onChange: (val: string) => void,
  ) => {
    onChange((currentValue || "") + newValue);
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
              name="textToAnalyze"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Text to Analyze</FormLabel>
                  <div className="flex gap-2 items-start">
                    <FormControl className="flex-1">
                      <Textarea
                        placeholder="Text or {{variable}} to analyze"
                        className="min-h-[100px] font-mono text-sm"
                        {...field}
                      />
                    </FormControl>
                    <VariablePicker
                      nodeId={nodeId}
                      onSelect={(val) =>
                        handleInsertVariable(field.value, val, field.onChange)
                      }
                    />
                  </div>
                  <FormDescription>
                    Enter static text or insert variables using the {`{}`} button
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <SaveTemplateButton
                nodeType={NodeType.SENTIMENT_ANALYSIS}
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