import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const pastDate = new Date();
  
  const updated = await prisma.user.updateMany({
    where: { 
      plan: "PRO",
      planExpiresAt: {
        lt: pastDate
      }
    },
    data: {
      plan: "FREE",
      planExpiresAt: null
    }
  });
  
  console.log(`Downgraded ${updated.count} expired users to FREE.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
