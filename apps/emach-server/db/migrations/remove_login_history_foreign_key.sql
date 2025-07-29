-- Migration: Remove foreign key constraint from LoginHistory table
-- Description: Makes LoginHistory table totally independent by removing the foreign key constraint
-- This allows LoginHistory to store userId values that may not exist in Register table

-- Drop the foreign key constraint
ALTER TABLE "LoginHistory" 
DROP CONSTRAINT IF EXISTS "fk_login_history_user";

-- The userId column will remain as UUID but without foreign key constraint
-- This allows storing any userId value without requiring it to exist in Register table

-- Add comment to clarify the change
COMMENT ON COLUMN "LoginHistory"."userId" IS 'User ID reference (no foreign key constraint - can store any UUID value)';

-- Optional: Add a comment to the table explaining the independence
COMMENT ON TABLE "LoginHistory" IS 'Independent login history tracking table with no foreign key constraints';
