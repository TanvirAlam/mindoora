-- Migration: Enhance LoginHistory table with additional tracking information
-- This adds more context to login tracking

-- Add new columns to LoginHistory table
ALTER TABLE "LoginHistory" 
ADD COLUMN IF NOT EXISTS "loginMethod" VARCHAR(50) DEFAULT 'password',
ADD COLUMN IF NOT EXISTS "ipAddress" INET,
ADD COLUMN IF NOT EXISTS "userAgent" TEXT,
ADD COLUMN IF NOT EXISTS "deviceInfo" JSONB,
ADD COLUMN IF NOT EXISTS "location" VARCHAR(255),
ADD COLUMN IF NOT EXISTS "success" BOOLEAN DEFAULT true;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_login_history_method ON "LoginHistory"("loginMethod");
CREATE INDEX IF NOT EXISTS idx_login_history_ip ON "LoginHistory"("ipAddress");
CREATE INDEX IF NOT EXISTS idx_login_history_success ON "LoginHistory"("success");
CREATE INDEX IF NOT EXISTS idx_login_history_time ON "LoginHistory"("loginTime" DESC);
