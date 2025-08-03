ALTER TABLE "Friends" ALTER COLUMN "groupU" SET DEFAULT '{"general"}';--> statement-breakpoint
ALTER TABLE "Friends" ALTER COLUMN "groupF" SET DEFAULT '{"general"}';--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "bio" text;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "location" varchar;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "website" varchar;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "twitter" varchar;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "instagram" varchar;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "linkedin" varchar;