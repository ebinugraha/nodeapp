import { PrismaClient } from "@prisma/client";
import { createId } from "@paralleldrive/cuid2";

const prisma = new PrismaClient();

async function main() {
  console.log("Fetching users...");
  const users = await prisma.user.findMany({
    take: 100,
  });

  if (users.length === 0) {
    console.log("No users found.");
    return;
  }

  let accountsCreated = 0;
  let credentialsCreated = 0;
  let nodesUpdated = 0;

  for (const user of users) {
    // 1. Create Account
    const existingAccount = await prisma.account.findFirst({
      where: { userId: user.id },
    });
    
    if (!existingAccount) {
      await prisma.account.create({
        data: {
          id: createId(),
          accountId: user.id, // For credential provider, accountId is usually user id or email
          providerId: "credential",
          userId: user.id,
          password: "dummy_hashed_password_123", // Fake hash for DB testing
        }
      });
      accountsCreated++;
    }

    // 2. Create Credential (e.g., YouTube Credential)
    let credential = await prisma.credential.findFirst({
      where: { userId: user.id, type: "YOUTUBE" },
    });

    if (!credential) {
      credential = await prisma.credential.create({
        data: {
          id: createId(),
          name: "My YouTube Account",
          value: JSON.stringify({ accessToken: "dummy_access_token", refreshToken: "dummy_refresh" }),
          type: "YOUTUBE",
          userId: user.id,
          dailyQuotaLimit: 10000,
          monthlyQuotaLimit: 300000,
        }
      });
      credentialsCreated++;
    }

    // 3. Relate nodes to the credential
    // Find all nodes for this user that require a youtube credential
    const workflows = await prisma.workflow.findMany({
      where: { userId: user.id },
      include: { nodes: true },
    });

    for (const wf of workflows) {
      for (const node of wf.nodes) {
        if (node.type === "YOUTUBE_LIVE_CHAT" || node.type === "YOUTUBE_DELETE_CHAT") {
          await prisma.node.update({
            where: { id: node.id },
            data: { credentialId: credential.id }
          });
          nodesUpdated++;
        }
      }
    }
  }

  console.log("Relations seeded successfully!");
  console.log(`- Created ${accountsCreated} Accounts.`);
  console.log(`- Created ${credentialsCreated} Credentials.`);
  console.log(`- Linked Credentials to ${nodesUpdated} Nodes.`);
}

main()
  .catch((e) => {
    console.error("Error seeding relations:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
