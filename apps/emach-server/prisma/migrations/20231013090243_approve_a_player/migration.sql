/*
  Warnings:

  - Added the required column `isApproved` to the `GamePlayers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GamePlayers" ADD COLUMN     "isApproved" BOOLEAN NOT NULL;
