/*
  Warnings:

  - You are about to drop the `GameRules` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "GameRules" DROP CONSTRAINT "GameRules_user_fkey";

-- AlterTable
ALTER TABLE "GamePlayers" ALTER COLUMN "isApproved" SET DEFAULT false;

-- AlterTable
ALTER TABLE "Languages" ALTER COLUMN "isActive" SET DEFAULT true;

-- AlterTable
ALTER TABLE "Register" ALTER COLUMN "verified" SET DEFAULT false;

-- AlterTable
ALTER TABLE "Subscription" ALTER COLUMN "isActive" SET DEFAULT true;

-- DropTable
DROP TABLE "GameRules";

-- CreateIndex
CREATE INDEX "Register_email_idx" ON "Register"("email");
