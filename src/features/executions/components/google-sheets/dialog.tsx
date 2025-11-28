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
import { Textarea } from "@/components/ui/textarea";
import { useCredentialsByType } from "@/features/credentials/hooks/use-credentials";
import { CredentialType } from "@/generated/prisma";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

const formSchema = z.object({
  variableName: z.string().min(1, "Variable Name is required"),
  credentialId: z.string().min(1, "Credential is required"),
  operation: z.enum(["read", "append"]),
  spreadsheetId: z.string().min(1, "Spreadsheet ID is required"),
  range: z.string().min(1, "Range/Sheet Name is required"),
  values: z.string().optional(), // JSON string untuk data yang akan di-append
});

export type GoogleSheetsFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (value: GoogleSheetsFormValues) => void;
  defaultValues?: Partial<GoogleSheetsFormValues>;
}

export const GoogleSheetsDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  // Menggunakan tipe credential GOOGLE (atau YOUTUBE yang sudah ada jika ingin reuse)
  const { data: credentials } = useCredentialsByType(CredentialType.GOOGLE);

  const form = useForm<GoogleSheetsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variableName: defaultValues.variableName || "mySheet",
      credentialId: defaultValues.credentialId || "",
      operation: defaultValues.operation || "read",
      spreadsheetId: defaultValues.spreadsheetId || "",
      range: defaultValues.range || "Sheet1!A1:D10",
      values: defaultValues.values || "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        variableName: defaultValues.variableName || "mySheet",
        credentialId: defaultValues.credentialId || "",
        operation: defaultValues.operation || "read",
        spreadsheetId: defaultValues.spreadsheetId || "",
        range: defaultValues.range || "Sheet1!A1:D10",
        values: defaultValues.values || "",
      });
    }
  }, [open, form, defaultValues]);

  const handleSubmit = (values: GoogleSheetsFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  const operation = form.watch("operation");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Google Sheets</DialogTitle>
          <DialogDescription>
            Read or append data to Google Sheets.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 mt-4"
          >
            {/* Variable Name */}
            <FormField
              control={form.control}
              name="variableName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Output Variable Name</FormLabel>
                  <FormControl>
                    <Input placeholder="sheetData" {...field} />
                  </FormControl>
                  <FormDescription>
                    Reference result as: {"{{sheetData.values}}"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Credential */}
            <FormField
              control={form.control}
              name="credentialId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Google Credential</FormLabel>
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
                          <div className="flex gap-2 items-center">
                            {/* Anda perlu menambahkan icon google sheet di folder public/logos */}
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

            {/* Operation */}
            <FormField
              control={form.control}
              name="operation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Operation</FormLabel>
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
                      <SelectItem value="read">Read Rows</SelectItem>
                      <SelectItem value="append">Append Rows</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            {/* Spreadsheet ID */}
            <FormField
              control={form.control}
              name="spreadsheetId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Spreadsheet ID</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The ID from the Google Sheet URL.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Range */}
            <FormField
              control={form.control}
              name="range"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Range / Sheet Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Sheet1!A:E" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Values (Only for Append) */}
            {operation === "append" && (
              <FormField
                control={form.control}
                name="values"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Values (JSON Array of Arrays)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='[["Name", "Email"], ["{{name}}", "{{email}}"]]'
                        className="font-mono text-xs h-24"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter a JSON array of arrays. Use variables like{" "}
                      {"{{input.data}}"}.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
