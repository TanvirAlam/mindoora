-- Migration: Update game room capacity from 1 to 5 players
-- This allows existing games to support multiplayer functionality with 2-5 players

-- Update all existing games to support up to 5 players
UPDATE "UserGame" 
SET "nPlayer" = 5 
WHERE "nPlayer" = 1;

-- Add a comment to document the change
COMMENT ON COLUMN "UserGame"."nPlayer" IS 'Maximum number of players allowed in a game room (2-5 players supported)';
