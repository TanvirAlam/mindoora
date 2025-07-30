-- Migration: Add loginStatus column to LoginHistory table
-- Description: Adds a new column to track whether the user is LOGGED IN or LOGGED OUT

-- Add the loginStatus column
ALTER TABLE "LoginHistory" 
ADD COLUMN "loginStatus" VARCHAR(20) DEFAULT 'LOGGED IN';

-- Add a check constraint to ensure only valid values
ALTER TABLE "LoginHistory" 
ADD CONSTRAINT "check_login_status" 
CHECK ("loginStatus" IN ('LOGGED IN', 'LOGGED OUT'));

-- Create an index for better query performance
CREATE INDEX "idx_login_history_status" ON "LoginHistory" ("loginStatus");

-- Update existing records based on loginMethod
UPDATE "LoginHistory" 
SET "loginStatus" = CASE 
    WHEN "loginMethod" = 'logout' THEN 'LOGGED OUT'
    ELSE 'LOGGED IN'
END;

-- Add comment to the column
COMMENT ON COLUMN "LoginHistory"."loginStatus" IS 'Status indicating whether the user is LOGGED IN or LOGGED OUT';
