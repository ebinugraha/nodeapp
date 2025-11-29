import { Braces } from "lucide-react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandInput,
} from "./ui/command";
import { useAvailableVariables } from "@/hooks/use-avaible-variables";

interface VariablePickerProps {
  nodeId: string;
  onSelect: (variableString: string) => void;
}

export const VariablePicker = ({ nodeId, onSelect }: VariablePickerProps) => {
  const variables = useAvailableVariables(nodeId);

  if (variables.length === 0) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          title="Insert Variable"
        >
          <Braces className="size-4 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <Command>
          <CommandInput placeholder="Search variable..." />
          <CommandList>
            {/* Grouping variables by Node Name is a nice touch! */}
            {/* Logic grouping sederhana */}
            <CommandGroup heading="Available Variables">
              {variables.map((v) => (
                <CommandItem
                  key={v.value}
                  onSelect={() => onSelect(v.value)}
                  className="cursor-pointer"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{v.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {v.value}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
