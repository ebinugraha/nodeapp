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
  delaySeconds: z.number().min(1).max(3600),
  delayType: z.enum(["seconds", "minutes", "hours"]),
  variableName: z.string(),
});

export type WaitDelayFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (value: WaitDelayFormValues) => void;
  defaultValues?: Partial<WaitDelayFormValues>;
}

export const WaitDelayDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const form = useForm<WaitDelayFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      delaySeconds: defaultValues.delaySeconds || 5,
      delayType: defaultValues.delayType || "seconds",
      variableName: defaultValues.variableName || "delayResult",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        delaySeconds: defaultValues.delaySeconds || 5,
        delayType: defaultValues.delayType || "seconds",
        variableName: defaultValues.variableName || "delayResult",
      });
    }
  }, [open, form, defaultValues]);

  const handleSubmit = (values: WaitDelayFormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  const formatDuration = () => {
    const seconds = form.watch("delaySeconds");
    const type = form.watch("delayType");
    switch (type) {
      case "minutes":
        return `${seconds} minute(s)`;
      case "hours":
        return `${seconds} hour(s)`;
      default:
        return `${seconds} second(s)`;
    }
  };

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
            <FormField
              control={form.control}
              name="delayType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delay Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select type" />
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

            <FormField
              control={form.control}
              name="delaySeconds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={form.watch("delayType") === "hours" ? 24 : form.watch("delayType") === "minutes" ? 60 : 3600}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                    />
                  </FormControl>
                  <FormDescription>
                    Total delay: {formatDuration()}
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
                    <Input placeholder="delayResult" {...field} />
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