-- Migration: Add UserTrophies table for storing user-uploaded custom trophies
-- Description: This table stores custom trophies uploaded by users with background removal

-- Create trophy rank enum
CREATE TYPE "trophy_rank" AS ENUM ('bronze', 'silver', 'gold', 'platinum');

-- Create UserTrophies table
CREATE TABLE "UserTrophies" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "name" varchar NOT NULL,
    "description" text,
    "trophyRank" "trophy_rank" NOT NULL DEFAULT 'bronze',
    "imageSrc" varchar NOT NULL, -- Image filename stored in /assets/users/
    "userId" uuid NOT NULL,
    "createdAt" timestamp DEFAULT now(),
    "updatedAt" timestamp DEFAULT now()
);

-- Add foreign key constraint
ALTER TABLE "UserTrophies" ADD CONSTRAINT "UserTrophies_userId_Register_id_fk" 
    FOREIGN KEY ("userId") REFERENCES "public"."Register"("id") ON DELETE cascade ON UPDATE no action;

-- Add comments to the table explaining the purpose
COMMENT ON TABLE "UserTrophies" IS 'Stores custom trophies uploaded by users with background-removed images';
COMMENT ON COLUMN "UserTrophies"."name" IS 'Name of the custom trophy';
COMMENT ON COLUMN "UserTrophies"."description" IS 'Description of the trophy';
COMMENT ON COLUMN "UserTrophies"."trophyRank" IS 'Trophy rank/rarity (bronze, silver, gold, platinum)';
COMMENT ON COLUMN "UserTrophies"."imageSrc" IS 'Filename of the trophy image stored in /assets/users/';
COMMENT ON COLUMN "UserTrophies"."userId" IS 'Reference to the user who uploaded the trophy';
