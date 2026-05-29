import { requireAuth } from "@/lib/auth-utils";
import { getYoutubeQuotaUsage, QuotaUsage } from "@/features/credentials/lib/quota-tracking";
import { NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{ credentialId: string }>;
}

export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    const session = await requireAuth();
    const userId = session.user?.id;
    const { credentialId } = await context.params;

    if (!credentialId) {
      return NextResponse.json(
        { error: "Credential ID is required" },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    const quotaUsage = await getYoutubeQuotaUsage(credentialId, userId);

    if (!quotaUsage) {
      return NextResponse.json(
        { error: "Credential not found or not a YouTube credential" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: quotaUsage,
    });
  } catch (error) {
    console.error("Error fetching quota usage:", error);
    return NextResponse.json(
      { error: "Failed to fetch quota usage" },
      { status: 500 }
    );
  }
}