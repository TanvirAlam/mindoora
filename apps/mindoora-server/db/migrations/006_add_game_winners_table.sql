-- Migration: Add GameWinners table for storing winners and trophies for each game
-- Description: This table stores the winners of each game with their assigned trophies and points

CREATE TABLE "GameWinners" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "gameId" uuid NOT NULL,
    "firstPlacePlayerId" uuid,
    "secondPlacePlayerId" uuid,
    "thirdPlacePlayerId" uuid,
    "firstPlaceTrophy" varchar, -- Trophy image URL/name for 1st place
    "secondPlaceTrophy" varchar, -- Trophy image URL/name for 2nd place
    "thirdPlaceTrophy" varchar, -- Trophy image URL/name for 3rd place
    "firstPlacePoints" integer DEFAULT 20, -- 20/20 points for 1st place
    "secondPlacePoints" integer DEFAULT 15, -- 15/20 points for 2nd place
    "thirdPlacePoints" integer DEFAULT 10, -- 10/20 points for 3rd place
    "createdAt" timestamp DEFAULT now(),
    "updatedAt" timestamp DEFAULT now()
);

-- Add foreign key constraints
ALTER TABLE "GameWinners" ADD CONSTRAINT "GameWinners_gameId_UserGame_id_fk" 
    FOREIGN KEY ("gameId") REFERENCES "public"."UserGame"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "GameWinners" ADD CONSTRAINT "GameWinners_firstPlacePlayerId_GamePlayers_id_fk" 
    FOREIGN KEY ("firstPlacePlayerId") REFERENCES "public"."GamePlayers"("id") ON DELETE set null ON UPDATE no action;

ALTER TABLE "GameWinners" ADD CONSTRAINT "GameWinners_secondPlacePlayerId_GamePlayers_id_fk" 
    FOREIGN KEY ("secondPlacePlayerId") REFERENCES "public"."GamePlayers"("id") ON DELETE set null ON UPDATE no action;

ALTER TABLE "GameWinners" ADD CONSTRAINT "GameWinners_thirdPlacePlayerId_GamePlayers_id_fk" 
    FOREIGN KEY ("thirdPlacePlayerId") REFERENCES "public"."GamePlayers"("id") ON DELETE set null ON UPDATE no action;

-- Add comments to the table explaining the purpose
COMMENT ON TABLE "GameWinners" IS 'Stores the winners of each game with their assigned trophies and points (1st: 20/20, 2nd: 15/20, 3rd: 10/20)';
COMMENT ON COLUMN "GameWinners"."gameId" IS 'Reference to the game';
COMMENT ON COLUMN "GameWinners"."firstPlacePlayerId" IS 'Player who won 1st place (20/20 points)';
COMMENT ON COLUMN "GameWinners"."secondPlacePlayerId" IS 'Player who won 2nd place (15/20 points)';
COMMENT ON COLUMN "GameWinners"."thirdPlacePlayerId" IS 'Player who won 3rd place (10/20 points)';
COMMENT ON COLUMN "GameWinners"."firstPlaceTrophy" IS 'Trophy image/name for 1st place winner';
COMMENT ON COLUMN "GameWinners"."secondPlaceTrophy" IS 'Trophy image/name for 2nd place winner';
COMMENT ON COLUMN "GameWinners"."thirdPlaceTrophy" IS 'Trophy image/name for 3rd place winner';
