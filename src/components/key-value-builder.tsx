import { PlusIcon, Trash2Icon } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { VariablePicker } from "./variable-picker"; // Reuse Variable Picker yang sudah dibuat!

export type KeyValuePair = {
  key: string;
  value: string;
};

interface KeyValueBuilderProps {
  items: KeyValuePair[];
  onChange: (items: KeyValuePair[]) => void;
  nodeId: string; // Diperlukan untuk Variable Picker
}

export const KeyValueBuilder = ({
  items,
  onChange,
  nodeId,
}: KeyValueBuilderProps) => {
  const handleAdd = () => {
    onChange([...items, { key: "", value: "" }]);
  };

  const handleRemove = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    onChange(newItems);
  };

  const handleChange = (
    index: number,
    field: keyof KeyValuePair,
    val: string
  ) => {
    const newItems = [...items];
    newItems[index][field] = val;
    onChange(newItems);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2 items-center">
            <Input
              placeholder="Key (e.g. email)"
              value={item.key}
              onChange={(e) => handleChange(index, "key", e.target.value)}
              className="flex-1"
            />

            <div className="flex-1 flex gap-1">
              <Input
                placeholder="Value"
                value={item.value}
                onChange={(e) => handleChange(index, "value", e.target.value)}
              />
              <VariablePicker
                nodeId={nodeId}
                onSelect={(val) =>
                  handleChange(index, "value", item.value + val)
                }
              />
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleRemove(index)}
            >
              <Trash2Icon className="size-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleAdd}
        className="w-fit gap-2 mt-2"
      >
        <PlusIcon className="size-3" /> Add Item
      </Button>
    </div>
  );
};
