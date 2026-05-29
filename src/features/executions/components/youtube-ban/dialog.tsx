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
  banType: z.enum(["temporary", "permanent"]),
  reason: z.string(),
  variableName: z.string(),
});

export type YouTubeBanFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (value: YouTubeBanFormValues) => void;
  defaultValues?: Partial<YouTubeBanFormValues>;
}

export const YouTubeBanDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const { data: credentials } = useCredentialsByType(CredentialType.YOUTUBE);

  const form = useForm<YouTubeBanFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      credentialId: defaultValues.credentialId || "",
      banType: defaultValues.banType || "permanent",
      reason: defaultValues.reason || "Severe violation of community guidelines",
      variableName: defaultValues.variableName || "banResult",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        credentialId: defaultValues.credentialId || "",
        banType: defaultValues.banType || "permanent",
        reason: defaultValues.reason || "Severe violation of community guidelines",
        variableName: defaultValues.variableName || "banResult",
      });
    }
  }, [open, form, defaultValues]);

  const handleSubmit = (values: YouTubeBanFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Ban User Configuration</DialogTitle>
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
              name="banType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ban Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select ban type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="permanent">Permanent Ban</SelectItem>
                      <SelectItem value="temporary">Temporary Ban</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Warning: Permanent bans cannot be undone
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
                      placeholder="Severe violation of community guidelines"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Reason for the ban
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
                    <Input placeholder="banResult" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <SaveTemplateButton
                nodeType={NodeType.YOUTUBE_BAN}
                currentConfig={form.getValues()}
              />
              <Button type="submit" variant="destructive">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};