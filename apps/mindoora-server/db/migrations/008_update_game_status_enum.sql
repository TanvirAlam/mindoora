-- Migration to add new game statuses
-- Add 'waiting' and 'started' to game_status enum

-- First, add the new values to the enum
ALTER TYPE game_status ADD VALUE IF NOT EXISTS 'waiting';
ALTER TYPE game_status ADD VALUE IF NOT EXISTS 'started';

-- Update any existing 'created' status rooms to 'waiting' status
UPDATE "GameRooms" SET status = 'waiting' WHERE status = 'created';

-- Note: PostgreSQL doesn't allow removing enum values easily
-- The 'created' value will remain in the enum but should not be used going forward
