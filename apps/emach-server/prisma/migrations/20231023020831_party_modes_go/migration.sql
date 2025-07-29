/*
  Warnings:

  - You are about to drop the column `cardName` on the `Questions` table. All the data in the column will be lost.
  - You are about to drop the column `cards` on the `UserGame` table. All the data in the column will be lost.
  - You are about to drop the column `partyMode` on the `UserGameDetails` table. All the data in the column will be lost.
  - You are about to drop the `PartyModes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserGameDetails" DROP CONSTRAINT "UserGameDetails_partyMode_fkey";

-- DropIndex
DROP INDEX "Questions_gameId_cardName_key";

-- DropIndex
DROP INDEX "UserGameDetails_partyMode_idx";

-- AlterTable
ALTER TABLE "Questions" DROP COLUMN "cardName";

-- AlterTable
ALTER TABLE "UserGame" DROP COLUMN "cards";

-- AlterTable
ALTER TABLE "UserGameDetails" DROP COLUMN "partyMode";

-- DropTable
DROP TABLE "PartyModes";
