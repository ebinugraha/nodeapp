import { zodResolver } from "@hookform/resolvers/zod";
import { CredentialType, NodeType } from "@prisma/client";
import Image from "next/image";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { NodeOutputHint } from "@/components/node-output-hint";
import { SaveTemplateButton } from "@/components/save-template-button";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { Textarea } from "@/components/ui/textarea";
import { useCredentialsByType } from "@/features/credentials/hooks/use-credentials";

const formSchema = z.object({
  credentialId: z.string().min(1, "Credential is required"),
  durationSeconds: z.number().min(60).max(604800),
  reason: z.string(),
  variableName: z.string(),
});

export type YouTubeTimeoutFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (value: YouTubeTimeoutFormValues) => void;
  defaultValues?: Partial<YouTubeTimeoutFormValues>;
}

export const YouTubeTimeoutDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const { data: credentials } = useCredentialsByType(CredentialType.YOUTUBE);

  const form = useForm<YouTubeTimeoutFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      credentialId: defaultValues.credentialId || "",
      durationSeconds: defaultValues.durationSeconds || 300,
      reason: defaultValues.reason || "Violation of community guidelines",
      variableName: defaultValues.variableName || "timeoutResult",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        credentialId: defaultValues.credentialId || "",
        durationSeconds: defaultValues.durationSeconds || 300,
        reason: defaultValues.reason || "Violation of community guidelines",
        variableName: defaultValues.variableName || "timeoutResult",
      });
    }
  }, [open, form, defaultValues]);

  const handleSubmit = (values: YouTubeTimeoutFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds} seconds`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours`;
    return `${Math.floor(seconds / 86400)} days`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Timeout User Configuration</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 w-full"
          >
            <FormField
              control={form.control}
              name="credentialId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>YouTube OAuth Credential</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select credential" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {credentials?.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          <div className="flex gap-2">
                            <Image
                              src={"/logos/youtube.svg"}
                              alt="YouTube Logo"
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

            <FormField
              control={form.control}
              name="durationSeconds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timeout Duration</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={60}
                      max={604800}
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 300)
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Duration: {formatDuration(field.value)} (60 seconds - 7
                    days)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Violation of community guidelines"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Reason shown to the user (optional)
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
                    <Input placeholder="timeoutResult" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <NodeOutputHint nodeType={NodeType.YOUTUBE_TIMEOUT} />

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <SaveTemplateButton
                nodeType={NodeType.YOUTUBE_TIMEOUT}
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
