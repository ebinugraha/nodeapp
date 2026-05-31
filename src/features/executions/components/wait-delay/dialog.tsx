import { zodResolver } from "@hookform/resolvers/zod";
import { NodeType } from "@prisma/client";
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
import { VariablePicker } from "@/components/variable-picker";

const formSchema = z.object({
  mode: z.enum(["fixed", "random"]),
  delayType: z.enum(["seconds", "minutes", "hours"]),
  delaySeconds: z.union([z.string(), z.number()]).optional(),
  minDelay: z.union([z.string(), z.number()]).optional(),
  maxDelay: z.union([z.string(), z.number()]).optional(),
  variableName: z.string(),
});

export type WaitDelayFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (value: WaitDelayFormValues) => void;
  defaultValues?: Partial<WaitDelayFormValues>;
  nodeId?: string;
}

export const WaitDelayDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
  nodeId = "wait-delay",
}: Props) => {
  const form = useForm<WaitDelayFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mode: defaultValues.mode || "fixed",
      delayType: defaultValues.delayType || "seconds",
      delaySeconds: defaultValues.delaySeconds || 5,
      minDelay: defaultValues.minDelay || 2,
      maxDelay: defaultValues.maxDelay || 5,
      variableName: defaultValues.variableName || "delayResult",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        mode: defaultValues.mode || "fixed",
        delayType: defaultValues.delayType || "seconds",
        delaySeconds: defaultValues.delaySeconds || 5,
        minDelay: defaultValues.minDelay || 2,
        maxDelay: defaultValues.maxDelay || 5,
        variableName: defaultValues.variableName || "delayResult",
      });
    }
  }, [open, form, defaultValues]);

  const handleSubmit = (values: WaitDelayFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  const handleInsertVariable = (
    currentValue: string | number | undefined,
    newValue: string,
    onChange: (val: string) => void,
  ) => {
    onChange((currentValue?.toString() || "") + newValue);
  };

  const mode = form.watch("mode");
  const delayType = form.watch("delayType");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Wait/Delay Configuration</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 w-full"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="mode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wait Mode</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select mode" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="fixed">Fixed Duration</SelectItem>
                        <SelectItem value="random">Random Range</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="delayType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time Unit</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="seconds">Seconds</SelectItem>
                        <SelectItem value="minutes">Minutes</SelectItem>
                        <SelectItem value="hours">Hours</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {mode === "fixed" ? (
              <FormField
                control={form.control}
                name="delaySeconds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fixed Duration</FormLabel>
                    <div className="flex gap-2 items-start">
                      <FormControl className="flex-1">
                        <Input
                          placeholder={`e.g. 5 or {{var}}`}
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <VariablePicker
                        nodeId={nodeId}
                        onSelect={(val) =>
                          handleInsertVariable(field.value, val, field.onChange)
                        }
                      />
                    </div>
                    <FormDescription>
                      Amount of {delayType} to wait.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="minDelay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Min Duration</FormLabel>
                      <div className="flex gap-2 items-start">
                        <FormControl className="flex-1">
                          <Input
                            placeholder={`Min`}
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <VariablePicker
                          nodeId={nodeId}
                          onSelect={(val) =>
                            handleInsertVariable(
                              field.value,
                              val,
                              field.onChange,
                            )
                          }
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="maxDelay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Duration</FormLabel>
                      <div className="flex gap-2 items-start">
                        <FormControl className="flex-1">
                          <Input
                            placeholder={`Max`}
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <VariablePicker
                          nodeId={nodeId}
                          onSelect={(val) =>
                            handleInsertVariable(
                              field.value,
                              val,
                              field.onChange,
                            )
                          }
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="variableName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Output Variable Name</FormLabel>
                  <FormControl>
                    <Input placeholder="delayResult" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <NodeOutputHint nodeType={NodeType.WAIT_DELAY} />

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <SaveTemplateButton
                nodeType={NodeType.WAIT_DELAY}
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
