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
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

const formSchema = z.object({
  variableName: z.string().min(1, "Variable Name is required (e.g. isBadWord)"),
  variable: z.string().min(1, "Value to check is required"),
  operator: z.enum(["equals", "contains", "not_contains"]),
  value: z.string().optional(),
});

export type DecisionFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (value: DecisionFormValues) => void;
  defaultValues?: Partial<DecisionFormValues>;
}

export const DecisionDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const form = useForm<DecisionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variableName: defaultValues.variableName || "", // Default value penting
      variable: defaultValues.variable || "",
      operator: defaultValues.operator || "equals",
      value: defaultValues.value || "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        variableName: defaultValues.variableName || "",
        variable: defaultValues.variable || "",
        operator: defaultValues.operator || "equals",
        value: defaultValues.value || "",
      });
    }
  }, [open, form, defaultValues]);

  const handleSubmit = (values: DecisionFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Decision Logic</DialogTitle>
          <DialogDescription>
            Jika kondisi <b>True</b>, workflow akan lanjut ke jalur hijau. Jika{" "}
            <b>False</b>, ke jalur merah.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 mt-4"
          >
            {/* PENTING: Variable Name untuk menyimpan hasil True/False */}
            <FormField
              control={form.control}
              name="variableName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Result Variable Name</FormLabel>
                  <FormControl>
                    <Input placeholder="isBadWord" {...field} />
                  </FormControl>
                  <FormDescription>
                    Nama variabel untuk menyimpan hasil keputusan (True/False).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-12 gap-2 items-end">
              {/* Value A (Dynamic) */}
              <div className="col-span-5">
                <FormField
                  control={form.control}
                  name="variable"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>If this value...</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="{{youtubeLiveChat.message}}"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Operator */}
              <div className="col-span-3">
                <FormField
                  control={form.control}
                  name="operator"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Operator</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="contains">Contains</SelectItem>
                          <SelectItem value="equals">Equals</SelectItem>
                          <SelectItem value="not_contains">
                            Does not contain
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              {/* Value B (Static) */}
              <div className="col-span-4">
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>...matches this</FormLabel>
                      <FormControl>
                        <Input placeholder="judi" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="submit">Save Logic</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
