import { PrismaClient } from "@prisma/client";
import { createId } from "@paralleldrive/cuid2";
import crypto from "crypto";

const prisma = new PrismaClient();

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

async function main() {
  console.log("Fetching users...");
  const users = await prisma.user.findMany({
    take: 100,
  });

  if (users.length === 0) {
    console.log("No users found.");
    return;
  }

  let sessionsCreated = 0;
  
  // Set expiration date to 30 days from now
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1",
  ];

  for (const user of users) {
    const existingSession = await prisma.session.findFirst({
      where: { userId: user.id },
    });
    
    if (!existingSession) {
      await prisma.session.create({
        data: {
          id: createId(),
          userId: user.id,
          token: generateToken(),
          expiresAt: expiresAt,
          ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          userAgent: userAgents[Math.floor(Math.random() * userAgents.length)],
        }
      });
      sessionsCreated++;
    }
  }

  console.log("Sessions seeded successfully!");
  console.log(`- Created ${sessionsCreated} active sessions.`);
}

main()
  .catch((e) => {
    console.error("Error seeding sessions:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
