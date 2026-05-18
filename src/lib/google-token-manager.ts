// src/lib/google-token-manager.ts
import prisma from "@/lib/db";
import { NonRetriableError } from "inngest";

interface GoogleCredentialValue {
  clientId: string;
  clientSecret: string;
  access_token: string;
  refresh_token: string;
  expires_in: number; // dalam detik
  updated_at: number; // timestamp ms
  connected: boolean;
}

/**
 * Mengambil Access Token yang valid.
 * Jika token expired, akan otomatis di-refresh dan database di-update.
 */
export const getOrRefreshAccessToken = async (credentialId: string) => {
  // 1. Ambil data dari DB
  const credential = await prisma.credential.findUnique({
    where: { id: credentialId },
  });

  if (!credential) {
    throw new NonRetriableError(`Credential not found: ${credentialId}`);
  }

  let tokenData: GoogleCredentialValue;
  try {
    tokenData = JSON.parse(credential.value);
  } catch (error) {
    throw new NonRetriableError("Invalid credential format (JSON parse error)");
  }

  // Validasi kelengkapan data
  if (
    !tokenData.refresh_token ||
    !tokenData.clientId ||
    !tokenData.clientSecret
  ) {
    throw new NonRetriableError(
      "Credential incompleted. Please reconnect your account (Missing refresh_token/client_id)"
    );
  }

  // 2. Cek Expired
  // expires_in biasanya 3599 detik. Kita kurangi buffer 5 menit (300 detik) biar aman.
  const now = Date.now();
  const expiresAt = tokenData.updated_at + tokenData.expires_in * 1000;
  const bufferTime = 5 * 60 * 1000; // 5 menit

  const isExpired = now >= expiresAt - bufferTime;

  // 3. Jika Masih Valid, kembalikan langsung
  if (!isExpired) {
    return tokenData.access_token;
  }

  // 4. Jika Expired, Lakukan Refresh
  console.log(
    `[TokenManager] Refreshing token for credential ${credentialId}...`
  );

  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: tokenData.clientId,
        client_secret: tokenData.clientSecret,
        refresh_token: tokenData.refresh_token,
        grant_type: "refresh_token",
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("[TokenManager] Refresh Failed:", errorBody);

      // Jika refresh token dicabut/invalid, user harus login ulang
      if (response.status === 400 || response.status === 401) {
        throw new NonRetriableError(
          "Refresh token invalid. Please Reconnect Account."
        );
      }
      throw new Error(`Failed to refresh token: ${response.statusText}`);
    }

    const newTokens = await response.json();

    // 5. Update Database dengan Token Baru
    const updatedValue: GoogleCredentialValue = {
      ...tokenData,
      access_token: newTokens.access_token,
      expires_in: newTokens.expires_in,
      updated_at: Date.now(),
      // Kadang Google merotasi refresh token juga, jika ada simpan yang baru
      refresh_token: newTokens.refresh_token || tokenData.refresh_token,
    };

    await prisma.credential.update({
      where: { id: credentialId },
      data: {
        value: JSON.stringify(updatedValue),
      },
    });

    console.log(
      `[TokenManager] Token refreshed successfully for ${credentialId}`
    );
    return updatedValue.access_token;
  } catch (error: any) {
    console.error("[TokenManager] Critical Error:", error);
    throw error;
  }
};
