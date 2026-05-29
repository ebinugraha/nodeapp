-- =====================================================
-- YouTube Quota Tracking Migration for Neon Database
-- =====================================================
-- Run this script in your Neon SQL Editor or via psql
-- =====================================================

-- Step 1: Add quota tracking columns to credential table
ALTER TABLE "credential"
ADD COLUMN IF NOT EXISTS "daily_quota_used" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "daily_quota_limit" INTEGER DEFAULT 10000,
ADD COLUMN IF NOT EXISTS "last_quota_reset" TIMESTAMP,
ADD COLUMN IF NOT EXISTS "monthly_quota_used" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "monthly_quota_limit" INTEGER DEFAULT 1000000,
ADD COLUMN IF NOT EXISTS "last_monthly_reset" TIMESTAMP;

-- Step 2: Verify columns were added
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'credential'
-- AND column_name IN ('daily_quota_used', 'daily_quota_limit', 'last_quota_reset',
--                      'monthly_quota_used', 'monthly_quota_limit', 'last_monthly_reset');

-- =====================================================
-- To run in Neon Dashboard:
-- 1. Go to https://console.neon.tech
-- 2. Select your project
-- 3. Go to SQL Editor
-- 4. Paste and run the ALTER TABLE command above
-- =====================================================