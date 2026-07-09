import { zodResolver } from "@hookform/resolvers/zod";
import { CredentialType, NodeType } from "@prisma/client";
import Image from "next/image";
import { useEffect, useState } from "react";
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
import { authClient } from "@/lib/auth-client";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  videoId: z.string().min(1, "Video ID is required"),
  pollingInterval: z.coerce
    .number()
    .min(30, "Minimum interval is 30s to avoid rate limits"), // Interval lebih lama untuk video biasa
  credentialId: z.string().min(1, "Account is required"), // [BARU]
});

export type YoutubeVideoCommentFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (value: YoutubeVideoCommentFormValues) => void;
  defaultValues?: Partial<YoutubeVideoCommentFormValues>;
}

const PRESETS = [
  { value: 30, label: "Fast (30s)", isPro: true },
  { value: 60, label: "Standard (60s)", isPro: false },
  { value: 300, label: "Slow (5m)", isPro: false },
  { value: "custom", label: "Custom (PRO)", isPro: true },
];

export const YoutubeVideoCommentDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const { data: credentials } = useCredentialsByType(CredentialType.YOUTUBE);
  const { data: session } = authClient.useSession();
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isPro = (session?.user as any)?.plan === "PRO";
  
  const [isCustomInterval, setIsCustomInterval] = useState(false);

  const form = useForm<YoutubeVideoCommentFormValues>({
    defaultValues: {
      videoId: defaultValues.videoId || "",
      pollingInterval: defaultValues.pollingInterval ?? 60,
      credentialId: defaultValues.credentialId || "", // [BARU]
    },
  });

  useEffect(() => {
    if (open) {
      const initialInterval = defaultValues.pollingInterval || 60;
      form.reset({
        videoId: defaultValues.videoId || "",
        pollingInterval: initialInterval,
        credentialId: defaultValues.credentialId || "", // [BARU]
      });
      setIsCustomInterval(![30, 60, 300].includes(initialInterval));
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
            {/* [BARU] Field Select Credential */}
            <FormField
              control={form.control}
              name="credentialId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>YouTube Account</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
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
                            {c.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
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
                  <FormLabel className="flex justify-between">
                    <span>Check Interval</span>
                    <span className="text-primary font-normal">{field.value} seconds</span>
                  </FormLabel>
                  <Select
                    value={isCustomInterval ? "custom" : field.value.toString()}
                    onValueChange={(val) => {
                      const option = PRESETS.find(p => p.value.toString() === val);
                      if (option?.isPro && !isPro) {
                        window.dispatchEvent(new CustomEvent("openUpgradeModal"));
                        return;
                      }
                      if (val === "custom") {
                        setIsCustomInterval(true);
                      } else {
                        setIsCustomInterval(false);
                        field.onChange(Number(val));
                      }
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select interval..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PRESETS.map((p) => (
                        <SelectItem key={p.value} value={p.value.toString()}>
                          <div className="flex items-center gap-2">
                            {p.label}
                            {p.isPro && !isPro && (
                              <Badge
                                variant="outline"
                                className="ml-2 text-[10px] px-1.5 py-0 bg-amber-500/10 text-amber-500 border-amber-500/20"
                              >
                                PRO
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {isCustomInterval && (
                    <FormControl>
                      <Input 
                        type="number" 
                        min={30} 
                        className="mt-2"
                        {...field}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (!isPro && val < 60) {
                            window.dispatchEvent(new CustomEvent("openUpgradeModal"));
                            return;
                          }
                          field.onChange(e);
                        }}
                      />
                    </FormControl>
                  )}
                  
                  <FormDescription className="text-xs">
                    {isPro 
                      ? "Minimum interval is 30s to avoid rate limits."
                      : "PRO required for intervals under 60s."}
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
        <NodeOutputHint nodeType={NodeType.YOUTUBE_VIDEO_COMMENT} />
      </DialogContent>
    </Dialog>
  );
};
