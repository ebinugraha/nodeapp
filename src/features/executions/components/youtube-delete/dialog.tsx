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
import { CredentialType } from "@/generated/prisma";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import z from "zod";
import Image from "next/image";

const formSchema = z.object({
  credentialId: z.string().min(1, "Credential is required"),
  messageId: z.string().min(1, "Message ID variable is required"),
  targetType: z.enum(["live-chat", "comment"]),
});

export type YoutubeDeleteFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (value: YoutubeDeleteFormValues) => void;
  defaultValues?: Partial<YoutubeDeleteFormValues>;
}

export const YoutubeDeleteDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  // Asumsi: Kita pakai tipe GOOGLE atau buat tipe baru YOUTUBE_OAUTH
  // Disini saya pakai tipe yang ada dulu atau bisa disesuaikan
  const { data: credentials } = useCredentialsByType(CredentialType.YOUTUBE); // Ganti dengan tipe yang sesuai nanti

  const form = useForm<YoutubeDeleteFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      credentialId: defaultValues.credentialId || "",
      messageId: defaultValues.messageId || "{{youtubeLiveChat.raw.id}}",
      targetType: defaultValues.targetType || "live-chat",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        credentialId: defaultValues.credentialId || "",
        messageId: defaultValues.messageId || "{{youtubeLiveChat.raw.id}}",
        targetType: defaultValues.targetType || "live-chat",
      });
    }
  }, [open, form, defaultValues]);

  const handleSubmit = (values: YoutubeDeleteFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Chat Configuration</DialogTitle>
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

            {/* Tambahkan Field Pilihan Tipe */}
            <FormField
              control={form.control}
              name="targetType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target To Delete</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="live-chat">
                        Live Chat Message
                      </SelectItem>
                      <SelectItem value="comment">Video Comment</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="messageId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message ID</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="{{youtubeLiveChat.raw.id}}"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Use Handlebars to reference the message ID from the trigger.
                  </FormDescription>
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
