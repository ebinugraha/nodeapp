import { NodeExecutor } from "@/features/executions/type";
import { NonRetriableError } from "inngest";
import Handlebars from "handlebars";

// Helper untuk Handlebars jika belum ada
if (!Handlebars.helpers.json) {
  Handlebars.registerHelper("json", (context) =>
    JSON.stringify(context, null, 2)
  );
}

type DecisionData = {
  variableName?: string; // Output Key (Wajib sama dengan yang dicari di functions.ts)
  variable?: string; // Input Value (misal: {{youtube.message}})
  operator?: "equals" | "contains" | "not_contains";
  value?: string; // Compare Value (misal: judi)
};

export const DecisionExecutor: NodeExecutor<DecisionData> = async ({
  data,
  context,
  nodeId,
  publish,
}) => {
  // 1. Validasi
  if (!data.variableName) {
    throw new NonRetriableError(
      "Decision node missing 'variableName' configuration"
    );
  }

  // 2. Parse variabel dari context menggunakan Handlebars
  // Contoh: data.variable = "{{youtubeLiveChat.message}}" -> actualValue = "Halo bang main slot yuk"
  const variable = Handlebars.compile(data.variable)(context);

  const compareValue = data.value || "";
  const operator = data.operator || "contains";

  let isTrue = false;

  // 3. Evaluasi Logika
  switch (operator) {
    case "equals":
      isTrue = variable === compareValue;
      break;
    case "contains":
      isTrue = variable.includes(compareValue);
      break;
    case "not_contains":
      isTrue = !variable.includes(compareValue);
      break;
    default:
      isTrue = false;
  }

  // DEBUGGING: Lihat log ini di Inngest Dashboard
  console.log(`[Decision Node ${nodeId}] Logic Check:`, {
    variable,
    operator,
    compareValue,
    RESULT: isTrue,
  });

  // 4. Return hasil dengan Key yang sesuai dengan variableName
  return {
    ...context,
    [data.variableName]: {
      result: isTrue, // Ini yang dibaca oleh functions.ts
      value: variable,
    },
  };
};
