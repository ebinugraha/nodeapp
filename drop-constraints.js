import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const constraintsToDrop = [
    'ALTER TABLE "node" DROP CONSTRAINT IF EXISTS "node_credentialId_fkey";',
    'ALTER TABLE "node" DROP CONSTRAINT IF EXISTS "node_workflowId_fkey";',
    'ALTER TABLE "connection" DROP CONSTRAINT IF EXISTS "connection_workflowId_fkey";',
    'ALTER TABLE "connection" DROP CONSTRAINT IF EXISTS "connection_fromNodeId_fkey";',
    'ALTER TABLE "connection" DROP CONSTRAINT IF EXISTS "connection_toNodeId_fkey";',
    'ALTER TABLE "Execution" DROP CONSTRAINT IF EXISTS "Execution_workflowId_fkey";',
    'ALTER TABLE "session" DROP CONSTRAINT IF EXISTS "session_userId_fkey";',
    'ALTER TABLE "account" DROP CONSTRAINT IF EXISTS "account_userId_fkey";',
    'ALTER TABLE "settings" DROP CONSTRAINT IF EXISTS "settings_userId_fkey";',
    'ALTER TABLE "template" DROP CONSTRAINT IF EXISTS "template_userId_fkey";',
    'ALTER TABLE "workflow" DROP CONSTRAINT IF EXISTS "workflow_userId_fkey";',
    'ALTER TABLE "Credential" DROP CONSTRAINT IF EXISTS "Credential_userId_fkey";',

    // Truncate existing data to fit new VarChar limits
    'UPDATE "user" SET "id" = LEFT("id", 36), "name" = LEFT("name", 60), "email" = LEFT("email", 254), "image" = LEFT("image", 500);',
    'UPDATE "session" SET "id" = LEFT("id", 36), "token" = LEFT("token", 64);',
    'UPDATE "workflow" SET "id" = LEFT("id", 36), "name" = LEFT("name", 70);',
    'UPDATE "Credential" SET "id" = LEFT("id", 36), "name" = LEFT("name", 100), "value" = LEFT("value", 500);',
    'UPDATE "node" SET "id" = LEFT("id", 36);',
    'UPDATE "connection" SET "id" = LEFT("id", 36);',
    'UPDATE "Execution" SET "id" = LEFT("id", 36);'
  ];

  for (const query of constraintsToDrop) {
    try {
      await prisma.$executeRawUnsafe(query);
      console.log('Successfully executed:', query);
    } catch (e) {
      console.log('Failed or not needed:', query, e.message);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
