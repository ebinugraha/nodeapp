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
  toxicityThreshold: z.number().min(0).max(1),
  spamThreshold: z.number().min(0).max(1),
  checkProfanity: z.boolean(),
  checkSpam: z.boolean(),
  variableName: z.string(),
});

export type AIModerationFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (value: AIModerationFormValues) => void;
  defaultValues?: Partial<AIModerationFormValues>;
}

export const AIModerationDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const form = useForm<AIModerationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      toxicityThreshold: defaultValues.toxicityThreshold || 0.7,
      spamThreshold: defaultValues.spamThreshold || 0.6,
      checkProfanity: defaultValues.checkProfanity ?? true,
      checkSpam: defaultValues.checkSpam ?? true,
      variableName: defaultValues.variableName || "moderationResult",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        toxicityThreshold: defaultValues.toxicityThreshold || 0.7,
        spamThreshold: defaultValues.spamThreshold || 0.6,
        checkProfanity: defaultValues.checkProfanity ?? true,
        checkSpam: defaultValues.checkSpam ?? true,
        variableName: defaultValues.variableName || "moderationResult",
      });
    }
  }, [open, form, defaultValues]);

  const handleSubmit = (values: AIModerationFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>AI Moderation Configuration</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 w-full"
          >
            <FormField
              control={form.control}
              name="toxicityThreshold"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Toxicity Threshold ({Math.round(field.value * 100)}%)</FormLabel>
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
                    Comments above this threshold will be auto-hidden
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="spamThreshold"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Spam Threshold ({Math.round(field.value * 100)}%)</FormLabel>
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
                    Comments above this threshold will be flagged for review
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="checkProfanity"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="mt-1"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Check for Profanity</FormLabel>
                    <FormDescription>
                      Detect profanity using AI analysis
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="checkSpam"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="mt-1"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Check for Spam</FormLabel>
                    <FormDescription>
                      Detect spam patterns (links, repeated chars, etc.)
                    </FormDescription>
                  </div>
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
                    <Input placeholder="moderationResult" {...field} />
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