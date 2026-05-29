-- Migration script for YouTube quota tracking
-- Run this SQL against your PostgreSQL database

-- Add quota tracking columns to credential table
ALTER TABLE "credential"
ADD COLUMN IF NOT EXISTS "daily_quota_used" INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS "daily_quota_limit" INTEGER DEFAULT 10000 NOT NULL,
ADD COLUMN IF NOT EXISTS "last_quota_reset" TIMESTAMP,
ADD COLUMN IF NOT EXISTS "monthly_quota_used" INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS "monthly_quota_limit" INTEGER DEFAULT 1000000 NOT NULL,
ADD COLUMN IF NOT EXISTS "last_monthly_reset" TIMESTAMP;

-- If the above fails (older PostgreSQL), try individual columns:
-- ALTER TABLE "credential" ADD COLUMN "daily_quota_used" INTEGER DEFAULT 0;
-- ALTER TABLE "credential" ADD COLUMN "daily_quota_limit" INTEGER DEFAULT 10000;
-- ALTER TABLE "credential" ADD COLUMN "last_quota_reset" TIMESTAMP;
-- ALTER TABLE "credential" ADD COLUMN "monthly_quota_used" INTEGER DEFAULT 0;
-- ALTER TABLE "credential" ADD COLUMN "monthly_quota_limit" INTEGER DEFAULT 1000000;
-- ALTER TABLE "credential" ADD COLUMN "last_monthly_reset" TIMESTAMP;

-- Verify the columns were added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'credential'
AND column_name LIKE '%quota%';