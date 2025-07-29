/*
  Warnings:

  - Added the required column `expiredAt` to the `GameRooms` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "gameStatus" ADD VALUE 'created';

-- AlterTable
ALTER TABLE "GameRooms" ADD COLUMN     "expiredAt" TIMESTAMP(3) NOT NULL;
