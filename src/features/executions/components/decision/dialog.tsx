import { zodResolver } from "@hookform/resolvers/zod";
import { NodeType } from "@prisma/client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { SaveTemplateButton } from "@/components/save-template-button";
import { VariablePicker } from "@/components/variable-picker";
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
import { GitBranchIcon } from "lucide-react";

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
  nodeId: string;
}

export const DecisionDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
  nodeId,
}: Props) => {
  const form = useForm<DecisionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variableName: defaultValues.variableName || "",
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

  const handleInsertVariable = (fieldName: "variable" | "value", val: string) => {
    const currentVal = form.getValues(fieldName) || "";
    form.setValue(fieldName, currentVal + val, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] overflow-hidden p-0">
        <div className="bg-gradient-to-r from-purple-500/10 to-transparent p-6 pb-4 border-b border-border/50">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg text-purple-600 dark:text-purple-400">
                <GitBranchIcon className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-xl">Decision Logic</DialogTitle>
                <DialogDescription className="mt-1 text-xs">
                  Create conditional branches based on dynamic variables.
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
                  Condition Settings
                </h4>

                {/* Value A (Dynamic) */}
                <FormField
                  control={form.control}
                  name="variable"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        If this value
                      </FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input
                            placeholder="{{youtubeLiveChat.message}}"
                            className="font-mono text-sm"
                            {...field}
                          />
                        </FormControl>
                        <VariablePicker
                          nodeId={nodeId}
                          onSelect={(val) =>
                            handleInsertVariable("variable", val)
                          }
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Operator */}
                <FormField
                  control={form.control}
                  name="operator"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Operator
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="font-medium bg-muted/30">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="equals">Equals (==)</SelectItem>
                          <SelectItem value="contains">Contains text</SelectItem>
                          <SelectItem value="not_contains">
                            Does not contain text
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                {/* Value B (Static/Dynamic) */}
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Matches this
                      </FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input 
                            placeholder="judi" 
                            className="font-mono text-sm"
                            {...field} 
                          />
                        </FormControl>
                        <VariablePicker
                          nodeId={nodeId}
                          onSelect={(val) =>
                            handleInsertVariable("value", val)
                          }
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Output Variable Name */}
              <div className="p-4 rounded-xl border border-border/50 bg-muted/20">
                <FormField
                  control={form.control}
                  name="variableName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        Output Result Variable
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="isBadWord" 
                          className="font-mono text-sm max-w-sm"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        This variable will store <code className="text-emerald-500 bg-emerald-500/10 px-1 py-0.5 rounded">true</code> or <code className="text-red-500 bg-red-500/10 px-1 py-0.5 rounded">false</code> based on the condition above.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2 pt-2 border-t border-border/40">
                <SaveTemplateButton
                  nodeType={NodeType.DECISION}
                  currentConfig={form.getValues()}
                />
                <Button type="submit" className="px-6 font-medium">Save Logic</Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
