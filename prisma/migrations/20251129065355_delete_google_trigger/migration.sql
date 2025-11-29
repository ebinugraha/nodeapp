/*
  Warnings:

  - The values [GOOGLE_FORM_TRIGGER,STRIPE_TRIGGER] on the enum `NodeType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "NodeType_new" AS ENUM ('INTITAL', 'MANUAL_TRIGGER', 'HTTP_REQUEST', 'ANTHROPIC', 'GEMINI', 'OPENAI', 'DEEPSEEK', 'DISCORD', 'SLACK', 'YOUTUBE_LIVE_CHAT', 'YOUTUBE_DELETE_CHAT', 'YOUTUBE_VIDEO_COMMENT', 'GOOGLE_SHEETS', 'DECISION');
ALTER TABLE "node" ALTER COLUMN "type" TYPE "NodeType_new" USING ("type"::text::"NodeType_new");
ALTER TYPE "NodeType" RENAME TO "NodeType_old";
ALTER TYPE "NodeType_new" RENAME TO "NodeType";
DROP TYPE "public"."NodeType_old";
COMMIT;
