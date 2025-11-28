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
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

const formSchema = z.object({
  videoId: z.string().min(1, "Video ID is required"),
  pollingInterval: z.coerce
    .number()
    .min(30, "Minimum interval is 30s to avoid rate limits"), // Interval lebih lama untuk video biasa
});

export type YoutubeVideoCommentFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (value: YoutubeVideoCommentFormValues) => void;
  defaultValues?: Partial<YoutubeVideoCommentFormValues>;
}

export const YoutubeVideoCommentDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const form = useForm<YoutubeVideoCommentFormValues>({
    defaultValues: {
      videoId: defaultValues.videoId || "",
      pollingInterval: defaultValues.pollingInterval ?? 60,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        videoId: defaultValues.videoId || "",
        pollingInterval: defaultValues.pollingInterval || 60,
      });
    }
  }, [open, form, defaultValues]);

  const handleSubmit = (values: YoutubeVideoCommentFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>YouTube Video Comment Setup</DialogTitle>
          <DialogDescription>
            Trigger workflow when a new top-level comment is posted on a video.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className="w-full space-y-6 mt-4"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <FormField
              control={form.control}
              name="videoId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Video ID</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. dQw4w9WgXcQ" {...field} />
                  </FormControl>
                  <FormDescription>
                    The ID from the YouTube video URL.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pollingInterval"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Check Interval (seconds)</FormLabel>
                  <FormControl>
                    <Input type="number" min={30} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button className="w-full" type="submit">
                Save Configuration
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
