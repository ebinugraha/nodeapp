-- Migration script for YouTube quota tracking
-- Run this SQL against your PostgreSQL database

-- Add quota tracking columns to credential table
ALTER TABLE "Credential"
ADD COLUMN IF NOT EXISTS "dailyQuotaUsed" INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS "dailyQuotaLimit" INTEGER,
ADD COLUMN IF NOT EXISTS "lastQuotaReset" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
ADD COLUMN IF NOT EXISTS "monthlyQuotaUsed" INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS "monthlyQuotaLimit" INTEGER,
ADD COLUMN IF NOT EXISTS "lastMonthlyReset" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL;