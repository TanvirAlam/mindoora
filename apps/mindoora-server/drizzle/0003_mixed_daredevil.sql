CREATE TYPE "public"."trophy_rank" AS ENUM('bronze', 'silver', 'gold', 'platinum');--> statement-breakpoint
CREATE TABLE "GameWinners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gameId" uuid NOT NULL,
	"firstPlacePlayerId" uuid,
	"secondPlacePlayerId" uuid,
	"thirdPlacePlayerId" uuid,
	"firstPlaceTrophy" varchar,
	"secondPlaceTrophy" varchar,
	"thirdPlaceTrophy" varchar,
	"firstPlacePoints" integer DEFAULT 20,
	"secondPlacePoints" integer DEFAULT 15,
	"thirdPlacePoints" integer DEFAULT 10,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "UserTrophies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"trophyRank" "trophy_rank" DEFAULT 'bronze' NOT NULL,
	"imageSrc" varchar NOT NULL,
	"userId" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "GameWinners" ADD CONSTRAINT "GameWinners_gameId_UserGame_id_fk" FOREIGN KEY ("gameId") REFERENCES "public"."UserGame"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "GameWinners" ADD CONSTRAINT "GameWinners_firstPlacePlayerId_GamePlayers_id_fk" FOREIGN KEY ("firstPlacePlayerId") REFERENCES "public"."GamePlayers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "GameWinners" ADD CONSTRAINT "GameWinners_secondPlacePlayerId_GamePlayers_id_fk" FOREIGN KEY ("secondPlacePlayerId") REFERENCES "public"."GamePlayers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "GameWinners" ADD CONSTRAINT "GameWinners_thirdPlacePlayerId_GamePlayers_id_fk" FOREIGN KEY ("thirdPlacePlayerId") REFERENCES "public"."GamePlayers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "UserTrophies" ADD CONSTRAINT "UserTrophies_userId_Register_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."Register"("id") ON DELETE cascade ON UPDATE no action;