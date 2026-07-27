import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import crypto from "crypto";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const ENCRYPTION_KEY = crypto
  .createHash("sha256")
  .update(process.env.BETTER_AUTH_SECRET || "default_secret_key_12345")
  .digest();

function decrypt(text: string) {
  const textParts = text.split(":");
  const iv = Buffer.from(textParts.shift()!, "hex");
  const encryptedText = Buffer.from(textParts.join(":"), "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/credentials?error=${error}`);
  }

  if (!code) {
    return NextResponse.json({ error: "Invalid request, missing code" }, { status: 400 });
  }

  // Get user session
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login`);
  }

  const cookieStore = req.cookies;
  const pendingCred = cookieStore.get("pending_oauth_credential")?.value;

  if (!pendingCred) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/credentials?error=session_expired`);
  }

  let decryptedPayload;
  try {
    decryptedPayload = JSON.parse(decrypt(pendingCred));
  } catch (err) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/credentials?error=invalid_session`);
  }

  const { credentialId, name, type, clientId, clientSecret, origin } = decryptedPayload;

  // Exchange Code for Tokens
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: `${origin || process.env.NEXT_PUBLIC_APP_URL}/api/credentials/oauth/callback`,
      grant_type: "authorization_code",
    }),
  });

  const tokens = await tokenResponse.json();

  if (!tokens.access_token) {
    const res = NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/credentials?error=invalid_credentials`);
    res.cookies.delete("pending_oauth_credential");
    return res;
  }

  // Update Database with tokens
  const newValue = JSON.stringify({
    clientId,
    clientSecret,
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_in: tokens.expires_in,
    updated_at: Date.now(),
    connected: true,
  });

  if (credentialId) {
    // Update existing
    await prisma.credential.update({
      where: { id: credentialId },
      data: {
        value: newValue,
        name: name || "Google Account",
      },
    });
  } else {
    // Create new ONLY IF it didn't fail
    await prisma.credential.create({
      data: {
        userId: session.user.id,
        name: name || "Google Account",
        type: type,
        value: newValue,
      },
    });
  }

  const res = NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_APP_URL}/credentials?success=true`
  );
  res.cookies.delete("pending_oauth_credential");
  return res;
}
