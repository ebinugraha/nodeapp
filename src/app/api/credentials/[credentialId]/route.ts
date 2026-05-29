import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ credentialId: string }> }
) {
  try {
    // Get session using better-auth pattern from tRPC
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { credentialId } = await params;

    const credential = await prisma.credential.findFirst({
      where: {
        id: credentialId,
        userId: session.user.id,
      },
    });

    if (!credential) {
      return NextResponse.json({ error: "Credential not found" }, { status: 404 });
    }

    return NextResponse.json(credential);
  } catch (error) {
    console.error("Error fetching credential:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
