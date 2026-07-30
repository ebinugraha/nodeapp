import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getOrRefreshAccessToken } from "@/lib/google-token-manager";

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse request body
    const body = await req.json();
    const { credentialId, spreadsheetId, action, range } = body;

    if (!credentialId || !spreadsheetId || !action) {
      return NextResponse.json(
        { error: "Missing required parameters (credentialId, spreadsheetId, action)" },
        { status: 400 }
      );
    }

    // 3. Get valid token using the Google Token Manager
    // This automatically checks expiration and refreshes if necessary
    let token: string;
    try {
      token = await getOrRefreshAccessToken(credentialId);
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message || "Failed to get access token" },
        { status: 401 }
      );
    }

    // 4. Handle the specific action
    if (action === "get_sheets") {
      const res = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        return NextResponse.json(
          { error: errorData.error?.message || "Failed to fetch sheets" },
          { status: res.status }
        );
      }

      const data = await res.json();
      return NextResponse.json(data);
    }

    if (action === "get_preview") {
      if (!range) {
        return NextResponse.json({ error: "Missing range for preview" }, { status: 400 });
      }

      // Fetch columns/headers
      const colsRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(`${range}!A1:Z1`)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      let columns: string[] = [];
      if (colsRes.ok) {
        const colsData = await colsRes.json();
        columns = colsData.values?.[0] || [];
      }

      // Fetch sample data
      const sampleRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(`${range}!A1:Z5`)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      let sampleData: string[][] | undefined = undefined;
      if (sampleRes.ok) {
        const sampleJson = await sampleRes.json();
        sampleData = sampleJson.values;
      }

      return NextResponse.json({ columns, sampleData });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    console.error("Google Sheets API Proxy Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
