import { zodResolver } from "@hookform/resolvers/zod";
import { CredentialType, NodeType } from "@prisma/client";
import Image from "next/image";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCredentialsByType } from "@/features/credentials/hooks/use-credentials";
import { NodeOutputHint } from "@/components/node-output-hint";
import { MessageCircleIcon, YoutubeIcon } from "lucide-react";

const formSchema = z.object({
  videoId: z.string().min(1),
  pollingInterval: z.coerce.number().min(5),
  credentialId: z.string().min(1, "Account is required"), // [BARU]
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
  const { data: credentials } = useCredentialsByType(CredentialType.YOUTUBE);

  const form = useForm<YoutubeLiveChatFormValues>({
    defaultValues: {
      videoId: defaultValues.videoId || "",
      pollingInterval: defaultValues.pollingInterval ?? 10,
      credentialId: defaultValues.credentialId || "", // [BARU]
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        videoId: defaultValues.videoId || "",
        pollingInterval: defaultValues.pollingInterval || 10,
        credentialId: defaultValues.credentialId || "", // [BARU]
      });
    }
  }, [open, form, defaultValues]);

  const handleSubmit = (values: YoutubeLiveChatFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] overflow-hidden p-0">
        <div className="bg-gradient-to-r from-red-500/10 to-transparent p-6 pb-4 border-b border-border/50">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-lg text-red-600 dark:text-red-400">
                <YoutubeIcon className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-xl">YouTube Live Chat</DialogTitle>
                <DialogDescription className="mt-1 text-xs">
                  Configure the trigger to listen to incoming live chat messages.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              <div className="space-y-4 p-4 rounded-xl border border-border bg-card shadow-sm">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  Connection Settings
                </h4>

                <FormField
                  control={form.control}
                  name="credentialId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        YouTube Account
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select account..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {credentials?.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              <div className="flex items-center gap-2">
                                <Image
                                  src="/logos/youtube.svg"
                                  alt="YT"
                                  width={16}
                                  height={16}
                                />
                                <span className="font-medium">{c.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4 p-4 rounded-xl border border-border bg-card shadow-sm">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  Stream Settings
                </h4>

                <FormField
                  control={form.control}
                  name="videoId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Video ID
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g. jNQXAC9IVRw" 
                          className="font-mono text-sm"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription className="text-[11px]">
                        Found in the URL: youtube.com/watch?v=<b className="text-foreground">VIDEO_ID</b>
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
                      <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex justify-between">
                        <span>Polling Interval</span>
                        <span className="text-primary normal-case font-normal">{field.value} seconds</span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="range" 
                          min={5} 
                          max={60} 
                          step={1}
                          className="cursor-pointer"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription className="text-[11px]">
                        Check for new messages every {field.value} seconds. (Minimum 5s).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="p-4 rounded-xl border border-border/50 bg-muted/20">
                <NodeOutputHint nodeType={NodeType.YOUTUBE_LIVE_CHAT} />
              </div>

              <DialogFooter className="pt-2 border-t border-border/40">
                <Button className="w-full sm:w-auto px-6 font-medium bg-red-600 hover:bg-red-700 text-white" type="submit">
                  Save Configuration
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
