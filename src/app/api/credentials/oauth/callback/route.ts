import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const credentialId = searchParams.get("state"); // Kita ambil ID dari state

  if (!code || !credentialId) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // 1. Ambil data Credential lagi untuk dapatkan Client Secret user
  const credential = await prisma.credential.findUnique({
    where: { id: credentialId },
  });

  if (!credential)
    return NextResponse.json(
      { error: "Credential not found" },
      { status: 404 }
    );

  const { clientId, clientSecret } = JSON.parse(credential.value);

  // 2. Tukar Code dengan Token (Pakai ID/Secret USER)
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId, // [PENTING] Punya User
      client_secret: clientSecret, // [PENTING] Punya User
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/credentials/oauth/callback`,
      grant_type: "authorization_code",
    }),
  });

  const tokens = await tokenResponse.json();

  if (!tokens.access_token) {
    return NextResponse.json(
      { error: "Failed to get tokens", details: tokens },
      { status: 500 }
    );
  }

  // 3. Update Database dengan Token Lengkap
  const newValue = JSON.stringify({
    clientId, // Tetap simpan ini untuk refresh token nanti
    clientSecret, // Tetap simpan ini
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_in: tokens.expires_in,
    updated_at: Date.now(),
    connected: true,
  });

  await prisma.credential.update({
    where: { id: credentialId },
    data: {
      value: newValue,
      // Opsional: Update nama biar keren
      name: credential.name.includes("Untitled")
        ? `YouTube Account (Connected)`
        : credential.name,
    },
  });

  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_APP_URL}/credentials?success=true`
  );
}
