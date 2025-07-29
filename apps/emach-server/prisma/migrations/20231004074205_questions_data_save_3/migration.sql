/*
  Warnings:

  - You are about to drop the `CardNames` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `user` to the `GameRules` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Questions" DROP CONSTRAINT "Questions_cardName_fkey";

-- AlterTable
ALTER TABLE "GameRules" ADD COLUMN     "user" TEXT NOT NULL;

-- DropTable
DROP TABLE "CardNames";

-- AddForeignKey
ALTER TABLE "GameRules" ADD CONSTRAINT "GameRules_user_fkey" FOREIGN KEY ("user") REFERENCES "Register"("id") ON DELETE CASCADE ON UPDATE CASCADE;
