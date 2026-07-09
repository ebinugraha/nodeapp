"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function cancelSubscription() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Set the plan back to FREE and clear planExpiresAt
  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      plan: "FREE",
      planExpiresAt: null,
    },
  });

  return { success: true };
}
