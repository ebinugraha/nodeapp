import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ where: { plan: "PRO" } });
  
  if (users.length === 0) {
    console.log("No PRO users found.");
    return;
  }
  
  for (const user of users) {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 2); // 2 days ago
    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        planExpiresAt: pastDate
      }
    });
    console.log(`Updated user ${user.email} (ID: ${user.id}) to have expired plan (planExpiresAt: ${pastDate})`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
