import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const PRO_PRICE = 99000;
const PAKKASIR_CHECKOUT_LINK = "https://app.pakasir.com/pay/cleenchat";

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // We add a timestamp to ensure order_id is unique per checkout attempt
    const orderId = `${session.user.id}_${Date.now()}`;

    // Get the base URL for redirect
    const host = req.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const redirectUrl = `${protocol}://${host}/settings`;

    const url = `${PAKKASIR_CHECKOUT_LINK}/${PRO_PRICE}?order_id=${encodeURIComponent(orderId)}&email=${encodeURIComponent(session.user.email)}&redirect=${encodeURIComponent(redirectUrl)}`;

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Checkout route error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
