import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db"; // Pastikan path import benar

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const credentialId = searchParams.get("credentialId");

  if (!credentialId) {
    return NextResponse.json(
      { error: "Credential ID required" },
      { status: 400 }
    );
  }

  // 1. Ambil Client ID & Secret yang tadi disimpan user
  const credential = await prisma.credential.findUnique({
    where: { id: credentialId },
  });

  if (!credential)
    return NextResponse.json(
      { error: "Credential not found" },
      { status: 404 }
    );

  const { clientId } = JSON.parse(credential.value); // Ambil Client ID user

  // 2. Setup Scope
  let scopes = [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
  ];
  if (credential.type === "YOUTUBE") {
    scopes.push("https://www.googleapis.com/auth/youtube.force-ssl");
  } else if (credential.type === "GOOGLE") {
    scopes.push("https://www.googleapis.com/auth/spreadsheets");
  }

  // 3. Redirect ke Google
  const params = new URLSearchParams({
    client_id: clientId, // [PENTING] Pakai punya User
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/credentials/oauth/callback`,
    response_type: "code",
    scope: scopes.join(" "),
    access_type: "offline",
    prompt: "consent",
    // [PENTING] Kirim credentialId di state agar callback tahu harus update record yang mana
    state: credentialId,
  });

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  );
}
