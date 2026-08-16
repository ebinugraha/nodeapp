import { PrismaClient } from "@prisma/client";
import { createId } from "@paralleldrive/cuid2";

const prisma = new PrismaClient();

const firstNames = [
  "Budi", "Andi", "Siti", "Ayu", "Dewi", "Agus", "Bambang", "Rina", "Ratna", "Sri",
  "Rudi", "Eko", "Hendra", "Dian", "Putri", "Tari", "Yudi", "Ahmad", "Irfan", "Rizki",
  "Dimas", "Reza", "Fajar", "Dinda", "Nita", "Maya", "Sari", "Lestari", "Indra", "Taufik",
  "Wahyu", "Adi", "Cahyo", "Doni", "Gilang", "Rafi", "Kiki", "Lia", "Rini", "Wulan",
  "Yuni", "Yoga", "Tio", "Rangga", "Rio", "Bima", "Seno", "Gita", "Dita", "Tia"
];

const lastNames = [
  "Santoso", "Wijaya", "Kusuma", "Setiawan", "Pratama", "Putra", "Nugroho", "Hidayat",
  "Saputra", "Lestari", "Siregar", "Nasution", "Hutagalung", "Sitompul", "Manurung",
  "Panggabean", "Simanjuntak", "Gunawan", "Halim", "Lim", "Wibowo", "Wahyudi", "Susanto",
  "Kurniawan", "Suryono", "Handayani", "Rahayu", "Fitriani", "Wahyuni", "Puspitasari",
  "Anggraini", "Sari", "Haryanto", "Prasetyo", "Ardiansyah", "Firmansyah", "Ramadhan",
  "Kusumawati", "Mulyani", "Utami", "Saputri", "Yulianti", "Novitasari", "Widiastuti"
];

const domains = ["gmail.com", "yahoo.co.id", "outlook.com", "icloud.com"];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  console.log("Cleaning up old test users...");
  // Hapus akun lama yang email-nya berawalan "testuser"
  const deleteResult = await prisma.user.deleteMany({
    where: {
      email: {
        startsWith: "testuser",
      },
    },
  });
  console.log(`Deleted ${deleteResult.count} old test users.`);

  console.log("Generating 100 Indonesian test users...");
  
  const users = Array.from({ length: 100 }).map(() => {
    const fn = getRandomItem(firstNames);
    const ln = getRandomItem(lastNames);
    const domain = getRandomItem(domains);
    
    // Generate email format like: budi.santoso99@gmail.com
    const randomNum = Math.floor(Math.random() * 1000);
    const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${randomNum}@${domain}`;
    
    return {
      id: createId(),
      name: `${fn} ${ln}`,
      email: email,
      emailVerified: true,
      plan: "FREE",
    };
  });

  const result = await prisma.user.createMany({
    data: users,
    skipDuplicates: true,
  });

  console.log(`Successfully created ${result.count} Indonesian test users!`);
}

main()
  .catch((e) => {
    console.error("Error creating users:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
