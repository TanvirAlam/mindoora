/*
  Warnings:

  - You are about to drop the column `isLive` on the `GameRooms` table. All the data in the column will be lost.
  - Added the required column `status` to the `GameRooms` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "gameStatus" AS ENUM ('live', 'finished', 'closed');

-- AlterTable
ALTER TABLE "GameRooms" DROP COLUMN "isLive",
ADD COLUMN     "status" "gameStatus" NOT NULL;
