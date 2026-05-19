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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import z from "zod";

const formSchema = z.object({
  logicOperator: z.enum(["AND", "OR"]),
  conditions: z.array(z.object({
    field: z.string(),
    operator: z.enum(["equals", "not_equals", "contains", "not_contains", "starts_with", "ends_with", "greater_than", "less_than", "regex"]),
    value: z.string(),
  })),
  variableName: z.string(),
});

export type FilterFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (value: FilterFormValues) => void;
  defaultValues?: Partial<FilterFormValues>;
}

export const FilterDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const form = useForm<FilterFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      logicOperator: defaultValues.logicOperator || "AND",
      conditions: defaultValues.conditions || [{ field: "", operator: "contains", value: "" }],
      variableName: defaultValues.variableName || "filterResult",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        logicOperator: defaultValues.logicOperator || "AND",
        conditions: defaultValues.conditions || [{ field: "", operator: "contains", value: "" }],
        variableName: defaultValues.variableName || "filterResult",
      });
    }
  }, [open, form, defaultValues]);

  const handleSubmit = (values: FilterFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  const addCondition = () => {
    const current = form.getValues("conditions");
    form.setValue("conditions", [...current, { field: "", operator: "contains", value: "" }]);
  };

  const removeCondition = (index: number) => {
    const current = form.getValues("conditions");
    form.setValue("conditions", current.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Filter Configuration</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 w-full"
          >
            <FormField
              control={form.control}
              name="logicOperator"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logic Operator</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select operator" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="AND">AND (all conditions must match)</SelectItem>
                      <SelectItem value="OR">OR (any condition must match)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    How conditions are combined
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <FormLabel>Conditions</FormLabel>
                <Button type="button" variant="outline" size="sm" onClick={addCondition}>
                  Add Condition
                </Button>
              </div>

              {form.watch("conditions").map((_, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <FormField
                    control={form.control}
                    name={`conditions.${index}.field`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input placeholder="field" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`conditions.${index}.operator`}
                    render={({ field }) => (
                      <FormItem>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="equals">equals</SelectItem>
                            <SelectItem value="not_equals">not equals</SelectItem>
                            <SelectItem value="contains">contains</SelectItem>
                            <SelectItem value="not_contains">not contains</SelectItem>
                            <SelectItem value="starts_with">starts with</SelectItem>
                            <SelectItem value="ends_with">ends with</SelectItem>
                            <SelectItem value="regex">regex</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`conditions.${index}.value`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input placeholder="value" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCondition(index)}
                  >
                    X
                  </Button>
                </div>
              ))}
            </div>

            <div className="bg-muted p-3 rounded-lg text-sm">
              <h4 className="font-medium mb-2">Available Fields:</h4>
              <ul className="text-muted-foreground space-y-1">
                <li>• comment.text / comment.message</li>
                <li>• comment.author</li>
                <li>• comment.videoId</li>
                <li>• sentimentResult.label</li>
                <li>• spamResult.isSpam</li>
                <li>• moderationResult.recommendation</li>
              </ul>
            </div>

            <FormField
              control={form.control}
              name="variableName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Output Variable Name</FormLabel>
                  <FormControl>
                    <Input placeholder="filterResult" {...field} />
                  </FormControl>
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