import { NodeExecutor } from "@/features/executions/type";
import { googleSheetsChannel } from "@/inngest/channels/google-sheets";
import { NonRetriableError } from "inngest";
import prisma from "@/lib/db";
import Handlebars from "handlebars";
import ky, { HTTPError } from "ky";

// Helper untuk Handlebars
if (!Handlebars.helpers.json) {
  Handlebars.registerHelper("json", (context) =>
    JSON.stringify(context, null, 2)
  );
}

type GoogleSheetsData = {
  variableName?: string;
  credentialId?: string;
  operation?: "read" | "append";
  spreadsheetId?: string;
  range?: string;
  values?: string; // JSON String
};

export const GoogleSheetsExecutor: NodeExecutor<GoogleSheetsData> = async ({
  data,
  nodeId,
  context,
  userId,
  publish,
}) => {
  await publish(googleSheetsChannel().status({ nodeId, status: "loading" }));

  try {
    // 1. Validasi Input
    if (
      !data.credentialId ||
      !data.spreadsheetId ||
      !data.range ||
      !data.variableName
    ) {
      throw new NonRetriableError(
        "Missing required configuration (Credential, ID, Range, Variable)"
      );
    }

    // 2. Ambil Credential (Access Token)
    const credential = await prisma.credential.findUnique({
      where: { id: data.credentialId, userId },
    });

    if (!credential) {
      throw new NonRetriableError("Credential not found");
    }

    // 3. Parse Handlebars Variables
    const spreadsheetId = Handlebars.compile(data.spreadsheetId)(context);
    const range = Handlebars.compile(data.range)(context);

    let resultData;

    // 4. Eksekusi Operasi
    if (data.operation === "read") {
      // --- READ ---
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`;
      const response = await ky
        .get(url, {
          headers: { Authorization: `Bearer ${credential.value}` },
        })
        .json<any>();

      resultData = {
        values: response.values || [],
        majorDimension: response.majorDimension,
      };
    } else if (data.operation === "append") {
      // --- APPEND ---
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append`;

      // Parse body JSON (karena user input string JSON array)
      let values = [];
      try {
        const rawValues = Handlebars.compile(data.values || "[]")(context);
        values = JSON.parse(rawValues);
      } catch (e) {
        throw new NonRetriableError("Invalid JSON format in 'Values' field");
      }

      const response = await ky
        .post(url, {
          headers: { Authorization: `Bearer ${credential.value}` },
          searchParams: { valueInputOption: "USER_ENTERED" },
          json: {
            range: range,
            majorDimension: "ROWS",
            values: values,
          },
        })
        .json<any>();

      resultData = {
        updates: response.updates,
        success: true,
      };
    }

    await publish(googleSheetsChannel().status({ nodeId, status: "success" }));

    // 5. Return Context
    return {
      ...context,
      [data.variableName]: resultData,
    };
  } catch (error: any) {
    console.error("Google Sheets Error:", error);
    await publish(googleSheetsChannel().status({ nodeId, status: "error" }));

    if (error instanceof HTTPError) {
      const errorBody = await error.response.json();
      throw new Error(`Google Sheets API Error: ${JSON.stringify(errorBody)}`);
    }
    throw error;
  }
};
