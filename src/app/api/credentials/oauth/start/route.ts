import { type NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const ENCRYPTION_KEY = crypto
  .createHash("sha256")
  .update(process.env.BETTER_AUTH_SECRET || "default_secret_key_12345")
  .digest();
const IV_LENGTH = 16;

function encrypt(text: string) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

export async function POST(req: NextRequest) {
  try {
    const { credentialId, name, type, clientId, clientSecret, origin } = await req.json();

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: "Client ID and Client Secret are required" },
        { status: 400 },
      );
    }

    // Setup Scope
    const scopes = [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ];
    if (type === "YOUTUBE") {
      scopes.push("https://www.googleapis.com/auth/youtube.force-ssl");
    } else if (type === "GOOGLE") {
      scopes.push("https://www.googleapis.com/auth/spreadsheets");
    }

    // Generate redirect URL
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: `${origin || process.env.NEXT_PUBLIC_APP_URL}/api/credentials/oauth/callback`,
      response_type: "code",
      scope: scopes.join(" "),
      access_type: "offline",
      prompt: "consent",
      state: "oauth_flow", 
    });

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

    const response = NextResponse.json({ url: googleAuthUrl });

    // Encrypt the payload and store it in an HttpOnly cookie
    const payload = JSON.stringify({ credentialId, name, type, clientId, clientSecret, origin });
    const encryptedPayload = encrypt(payload);

    response.cookies.set("pending_oauth_credential", encryptedPayload, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 10 * 60, // 10 minutes to complete oauth
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("OAuth Start Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
