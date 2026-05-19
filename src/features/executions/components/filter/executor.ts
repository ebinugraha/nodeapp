import { NodeExecutor } from "@/features/executions/type";

type FilterData = {
  variableName?: string;
  conditions: FilterCondition[];
  logicOperator?: "AND" | "OR";
};

type FilterCondition = {
  field: string;
  operator: "equals" | "not_equals" | "contains" | "not_contains" | "starts_with" | "ends_with" | "greater_than" | "less_than" | "regex";
  value: string;
};

type FilterResult = {
  passed: boolean;
  matchedConditions: string[];
  failedConditions: string[];
};

export const FilterConditionExecutor: NodeExecutor<FilterData> = async ({
  data,
  context,
  step,
}) => {
  return step.run("filter-condition", async () => {
    const conditions = data.conditions || [];
    const logicOperator = data.logicOperator || "AND";

    if (conditions.length === 0) {
      return {
        ...context,
        [data.variableName || "filterResult"]: {
          passed: true,
          matchedConditions: [],
          failedConditions: [],
        },
      };
    }

    const matchedConditions: string[] = [];
    const failedConditions: string[] = [];
    let passed = true;

    for (const condition of conditions) {
      // Get the field value from context using dot notation
      const fieldValue = getNestedValue(context, condition.field);
      const conditionMet = evaluateCondition(fieldValue, condition.operator, condition.value);

      if (conditionMet) {
        matchedConditions.push(`${condition.field} ${condition.operator} ${condition.value}`);
      } else {
        failedConditions.push(`${condition.field} ${condition.operator} ${condition.value}`);
      }
    }

    // Apply logic operator
    if (logicOperator === "AND") {
      passed = failedConditions.length === 0;
    } else {
      passed = matchedConditions.length > 0;
    }

    return {
      ...context,
      [data.variableName || "filterResult"]: {
        passed,
        matchedConditions,
        failedConditions,
        logicOperator,
        timestamp: new Date().toISOString(),
      } as FilterResult,
    };
  });
};

// Helper function to get nested value from object using dot notation
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce((current: unknown, key) => {
    if (current && typeof current === "object" && key in current) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

// Helper function to evaluate condition
function evaluateCondition(
  fieldValue: unknown,
  operator: string,
  conditionValue: string
): boolean {
  const fieldStr = String(fieldValue || "").toLowerCase();
  const condStr = conditionValue.toLowerCase();

  switch (operator) {
    case "equals":
      return fieldStr === condStr;
    case "not_equals":
      return fieldStr !== condStr;
    case "contains":
      return fieldStr.includes(condStr);
    case "not_contains":
      return !fieldStr.includes(condStr);
    case "starts_with":
      return fieldStr.startsWith(condStr);
    case "ends_with":
      return fieldStr.endsWith(condStr);
    case "greater_than":
      return parseFloat(fieldStr) > parseFloat(condStr);
    case "less_than":
      return parseFloat(fieldStr) < parseFloat(condStr);
    case "regex":
      try {
        const regex = new RegExp(conditionValue, "i");
        return regex.test(String(fieldValue || ""));
      } catch {
        return false;
      }
    default:
      return false;
  }
}