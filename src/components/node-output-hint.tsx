import { NodeType } from "@prisma/client";
import { NODE_OUTPUTS } from "@/config/node-outputs";

interface Props {
  nodeType: NodeType;
}

export const NodeOutputHint = ({ nodeType }: Props) => {
  const outputs = NODE_OUTPUTS[nodeType];

  if (!outputs || outputs.length === 0) {
    return null;
  }

  return (
    <div className="bg-muted p-4 rounded-lg mt-4">
      <h4 className="text-sm font-medium mb-2">Available Output Fields:</h4>
      <p className="text-xs text-muted-foreground mb-3">
        These variables will be available for subsequent nodes. Access them using:{" "}
        <code className="text-primary bg-primary/10 px-1 py-0.5 rounded">{"{{yourVariableName.field}}"}</code>
      </p>
      <ul className="text-xs text-muted-foreground space-y-1.5">
        {outputs.map((output) => (
          <li key={output.key} className="flex items-start">
            <span className="mr-2 opacity-50">•</span>
            <div className="flex-1">
              <code className="bg-background px-1 py-0.5 rounded text-foreground font-medium">
                {output.key}
              </code>
              <span className="ml-2 text-muted-foreground/80">{output.label}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
