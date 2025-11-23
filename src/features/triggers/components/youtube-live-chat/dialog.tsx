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
  videoId: z.string().min(1),
  pollingInterval: z.coerce.number().min(5),
});

export type YoutubeLiveChatFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (value: YoutubeLiveChatFormValues) => void;
  defaultValues?: Partial<YoutubeLiveChatFormValues>;
}

export const YoutubeLiveChatDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const form = useForm<YoutubeLiveChatFormValues>({
    defaultValues: {
      videoId: defaultValues.videoId || "",
      pollingInterval: defaultValues.pollingInterval ?? 10,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        videoId: defaultValues.videoId || "",
        pollingInterval: defaultValues.pollingInterval || 10,
      });
    }
  }, [open, form, defaultValues]);

  const handleSubmit = (values: YoutubeLiveChatFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>YouTube Live Chat Configuration</DialogTitle>
          <DialogDescription>
            Enter the Video ID of your YouTube Live Stream.
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
                    <Input placeholder="e.g. jNQXAC9IVRw" {...field} />
                  </FormControl>
                  <FormDescription>
                    Found in the URL: youtube.com/watch?v=<b>VIDEO_ID</b>
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
                  <FormLabel>Interval (seconds)</FormLabel>
                  <FormControl>
                    <Input type="number" min={5} {...field} />
                  </FormControl>
                  <FormDescription>
                    Check for new messages every X seconds.
                  </FormDescription>
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
