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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCredentialsByType } from "@/features/credentials/hooks/use-credentials";
import { CredentialType, NodeType } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import z from "zod";
import Image from "next/image";
import { SaveTemplateButton } from "@/components/save-template-button";


const formSchema = z.object({
  credentialId: z.string().min(1, "Credential is required"),
  reason: z.enum(["spam", "predatory", "inappropriate_minors", "harassment_bullying"]),
  variableName: z.string(),
});

export type YouTubeFlagFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (value: YouTubeFlagFormValues) => void;
  defaultValues?: Partial<YouTubeFlagFormValues>;
}

export const YouTubeFlagDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const { data: credentials } = useCredentialsByType(CredentialType.YOUTUBE);

  const form = useForm<YouTubeFlagFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      credentialId: defaultValues.credentialId || "",
      reason: defaultValues.reason || "spam",
      variableName: defaultValues.variableName || "flagResult",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        credentialId: defaultValues.credentialId || "",
        reason: defaultValues.reason || "spam",
        variableName: defaultValues.variableName || "flagResult",
      });
    }
  }, [open, form, defaultValues]);

  const handleSubmit = (values: YouTubeFlagFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Flag Comment Configuration</DialogTitle>
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
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Flag Reason</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select reason" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="spam">Spam</SelectItem>
                      <SelectItem value="predatory">Predatory</SelectItem>
                      <SelectItem value="inappropriate_minors">Inappropriate (Minors)</SelectItem>
                      <SelectItem value="harassment_bullying">Harassment / Bullying</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the reason for flagging this comment to YouTube
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
                    <Input placeholder="flagResult" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <SaveTemplateButton
                nodeType={NodeType.YOUTUBE_FLAG}
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