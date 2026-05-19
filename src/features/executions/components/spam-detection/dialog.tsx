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
  checkLinks: z.boolean(),
  checkRepeatedChars: z.boolean(),
  checkCapsLock: z.boolean(),
  linkThreshold: z.number().min(1),
  repeatedCharLimit: z.number().min(3),
  capsLockThreshold: z.number().min(0.5).max(1),
  variableName: z.string(),
});

export type SpamDetectionFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (value: SpamDetectionFormValues) => void;
  defaultValues?: Partial<SpamDetectionFormValues>;
}

export const SpamDetectionDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const form = useForm<SpamDetectionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      checkLinks: defaultValues.checkLinks ?? true,
      checkRepeatedChars: defaultValues.checkRepeatedChars ?? true,
      checkCapsLock: defaultValues.checkCapsLock ?? true,
      linkThreshold: defaultValues.linkThreshold || 1,
      repeatedCharLimit: defaultValues.repeatedCharLimit || 4,
      capsLockThreshold: defaultValues.capsLockThreshold || 0.7,
      variableName: defaultValues.variableName || "spamResult",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        checkLinks: defaultValues.checkLinks ?? true,
        checkRepeatedChars: defaultValues.checkRepeatedChars ?? true,
        checkCapsLock: defaultValues.checkCapsLock ?? true,
        linkThreshold: defaultValues.linkThreshold || 1,
        repeatedCharLimit: defaultValues.repeatedCharLimit || 4,
        capsLockThreshold: defaultValues.capsLockThreshold || 0.7,
        variableName: defaultValues.variableName || "spamResult",
      });
    }
  }, [open, form, defaultValues]);

  const handleSubmit = (values: SpamDetectionFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Spam Detection Configuration</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 w-full"
          >
            <FormField
              control={form.control}
              name="checkLinks"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel>Detect Links</FormLabel>
                    <FormDescription>
                      Flag comments containing URLs
                    </FormDescription>
                  </div>
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="w-4 h-4"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="checkRepeatedChars"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel>Detect Repeated Characters</FormLabel>
                    <FormDescription>
                      Flag comments like "AAAAAAA" or "!!!!!!"
                    </FormDescription>
                  </div>
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="w-4 h-4"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="checkCapsLock"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel>Detect Excessive Caps</FormLabel>
                    <FormDescription>
                      Flag comments with too many capital letters
                    </FormDescription>
                  </div>
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="w-4 h-4"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="capsLockThreshold"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Caps Threshold ({Math.round(field.value * 100)}%)</FormLabel>
                  <FormControl>
                    <Input
                      type="range"
                      min={50}
                      max={100}
                      step={5}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) / 100)}
                    />
                  </FormControl>
                  <FormDescription>
                    Percentage of caps letters to trigger flag
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
                    <Input placeholder="spamResult" {...field} />
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