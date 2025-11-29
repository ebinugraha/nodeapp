import { useReactFlow, getIncomers } from "@xyflow/react";
import { NODE_OUTPUTS } from "@/config/node-outputs";
import { useMemo } from "react";

export const useAvailableVariables = (currentNodeId: string) => {
  const { getNodes, getEdges } = useReactFlow();

  const variables = useMemo(() => {
    const nodes = getNodes();
    const edges = getEdges();
    const currentNode = nodes.find((n) => n.id === currentNodeId);

    if (!currentNode) return [];

    // Cari semua node yang terhubung ke node ini (Parents)
    // getIncomers adalah helper bawaan React Flow! Sangat praktis.
    const allIncomers = getIncomers(currentNode, nodes, edges);

    // Map node-node tersebut ke variabel output mereka
    return allIncomers.flatMap((node) => {
      const nodeType = node.type as keyof typeof NODE_OUTPUTS;
      const outputs = NODE_OUTPUTS[nodeType] || [];

      // Variable Name dari node tersebut (misal: "myYoutube")
      // Default fallback ke tipe node jika user lupa kasih nama variabel
      const varPrefix = node.data.variableName || node.type;

      return outputs.map((output) => ({
        ...output,
        // Hasil: {{myYoutube.message}}
        value: `{{${varPrefix}.${output.key}}}`,
        nodeName: node.data.name || node.type, // Untuk label group di UI
      }));
    });
  }, [currentNodeId, getNodes, getEdges]);

  return variables;
};
