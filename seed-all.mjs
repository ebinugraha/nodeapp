import { PrismaClient } from "@prisma/client";
import { createId } from "@paralleldrive/cuid2";

const prisma = new PrismaClient();

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  console.log("Fetching existing users...");
  const users = await prisma.user.findMany({
    take: 100, // Let's seed for up to 100 users
  });

  if (users.length === 0) {
    console.log("No users found. Please run seed-users.mjs first.");
    return;
  }

  console.log(`Found ${users.length} users. Seeding related data...`);

  let workflowsCreated = 0;
  let settingsCreated = 0;
  let executionsCreated = 0;

  for (const user of users) {
    // 1. Seed Settings (if not exists)
    const existingSettings = await prisma.settings.findUnique({
      where: { userId: user.id },
    });
    
    if (!existingSettings) {
      await prisma.settings.create({
        data: {
          id: createId(),
          userId: user.id,
          theme: Math.random() > 0.5 ? "dark" : "light",
          emailExecution: true,
          emailError: true,
        }
      });
      settingsCreated++;
    }

    // 2. Seed Workflows (Randomly 1 to 3 workflows per user)
    const numWorkflows = randomInt(1, 3);
    for (let i = 0; i < numWorkflows; i++) {
      const workflowId = createId();
      const workflowName = getRandomItem([
        "Auto Delete Judi Online",
        "Moderasi Spam Live Chat",
        "Notifikasi Discord",
        "Filter Komentar Negatif"
      ]) + ` ${i + 1}`;

      await prisma.workflow.create({
        data: {
          id: workflowId,
          name: workflowName,
          userId: user.id,
        }
      });
      workflowsCreated++;

      // 3. Seed Nodes for the workflow (A simple DAG: Trigger -> Gambling Checker -> Action)
      const node1Id = createId();
      const node2Id = createId();
      const node3Id = createId();

      await prisma.node.createMany({
        data: [
          {
            id: node1Id,
            workflowId: workflowId,
            name: "YouTube Live Chat",
            type: "YOUTUBE_LIVE_CHAT",
            position: { x: 100, y: 100 },
            data: { url: "https://youtube.com/live/..." },
          },
          {
            id: node2Id,
            workflowId: workflowId,
            name: "Gambling Checker",
            type: "GAMBLING_CHECKER",
            position: { x: 400, y: 100 },
            data: { strictness: "high" },
          },
          {
            id: node3Id,
            workflowId: workflowId,
            name: "Delete Chat",
            type: "YOUTUBE_DELETE_CHAT",
            position: { x: 700, y: 100 },
            data: {},
          }
        ]
      });

      // 4. Seed Connections
      await prisma.connection.createMany({
        data: [
          {
            id: createId(),
            workflowId: workflowId,
            fromNodeId: node1Id,
            toNodeId: node2Id,
            fromOutput: "main",
            toInput: "main",
          },
          {
            id: createId(),
            workflowId: workflowId,
            fromNodeId: node2Id,
            toNodeId: node3Id,
            fromOutput: "match", // Simulated output for match
            toInput: "main",
          }
        ]
      });

      // 5. Seed Executions (Randomly 0 to 5 executions per workflow)
      const numExecutions = randomInt(0, 5);
      const executionData = [];
      for (let j = 0; j < numExecutions; j++) {
        const isSuccess = Math.random() > 0.2;
        executionData.push({
          id: createId(),
          workflowId: workflowId,
          status: isSuccess ? "SUCCESS" : "FAILED",
          inngestEventId: `evt_${createId()}`,
          output: isSuccess ? { deletedCount: randomInt(1, 10) } : null,
          error: isSuccess ? null : "Failed to connect to YouTube API",
          startedAt: new Date(Date.now() - randomInt(1000, 10000000)),
          completedAt: new Date(Date.now() - randomInt(100, 500000)),
        });
      }
      
      if (executionData.length > 0) {
        await prisma.execution.createMany({
          data: executionData
        });
        executionsCreated += executionData.length;
      }
    }
  }

  console.log("Seeding completed successfully!");
  console.log(`- Created Settings for ${settingsCreated} users.`);
  console.log(`- Created ${workflowsCreated} Workflows (with their Nodes & Connections).`);
  console.log(`- Created ${executionsCreated} execution logs.`);
}

main()
  .catch((e) => {
    console.error("Error seeding related data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
