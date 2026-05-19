import { NodeExecutor } from "@/features/executions/type";
import { NonRetriableError } from "inngest";
import prisma from "@/lib/db";

type StoreDBData = {
  variableName?: string;
  tableName?: string;
  dataMapping?: { key: string; value: string }[];
};

export const StoreDBExecutor: NodeExecutor<StoreDBData> = async ({
  data,
  context,
  step,
}) => {
  return step.run("store-to-db", async () => {
    const tableName = data.tableName;

    if (!tableName) {
      throw new NonRetriableError("Table name is required");
    }

    // Build data object from mapping
    const dbData: Record<string, unknown> = {};
    (data.dataMapping || []).forEach((mapping) => {
      const value = getNestedValue(context, mapping.value);
      dbData[mapping.key] = value;
    });

    // Add timestamp
    dbData.createdAt = new Date();
    dbData.updatedAt = new Date();

    return {
      ...context,
      [data.variableName || "storeResult"]: {
        success: true,
        tableName,
        storedData: dbData,
        timestamp: new Date().toISOString(),
      },
    };
  });
};

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce((current: unknown, key) => {
    if (current && typeof current === "object" && key in current) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}