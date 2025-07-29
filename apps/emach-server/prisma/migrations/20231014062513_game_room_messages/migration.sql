/*
  Warnings:

  - You are about to drop the column `gamePlayerId` on the `QuestionsSolved` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[roomId,name]` on the table `GamePlayers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[gameId,cardName]` on the table `Questions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[gameId,question]` on the table `Questions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[playerId,questionId]` on the table `QuestionsSolved` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `playerId` to the `QuestionsSolved` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "QuestionsSolved" DROP CONSTRAINT "QuestionsSolved_gamePlayerId_fkey";

-- AlterTable
ALTER TABLE "QuestionsSolved" DROP COLUMN "gamePlayerId",
ADD COLUMN     "playerId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "GameRoomMessages" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "fileUrl" TEXT,
    "playerId" TEXT NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "GameRoomMessages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GameRoomMessages_playerId_idx" ON "GameRoomMessages"("playerId");

-- CreateIndex
CREATE INDEX "GameRoomMessages_roomId_idx" ON "GameRoomMessages"("roomId");

-- CreateIndex
CREATE UNIQUE INDEX "GameRoomMessages_roomId_playerId_key" ON "GameRoomMessages"("roomId", "playerId");

-- CreateIndex
CREATE INDEX "EmailVerify_email_idx" ON "EmailVerify"("email");

-- CreateIndex
CREATE INDEX "GamePlayers_roomId_idx" ON "GamePlayers"("roomId");

-- CreateIndex
CREATE UNIQUE INDEX "GamePlayers_roomId_name_key" ON "GamePlayers"("roomId", "name");

-- CreateIndex
CREATE INDEX "GameRooms_user_idx" ON "GameRooms"("user");

-- CreateIndex
CREATE INDEX "GameRooms_gameId_idx" ON "GameRooms"("gameId");

-- CreateIndex
CREATE INDEX "GameRules_user_idx" ON "GameRules"("user");

-- CreateIndex
CREATE INDEX "Images_user_idx" ON "Images"("user");

-- CreateIndex
CREATE INDEX "LoginHistory_userId_idx" ON "LoginHistory"("userId");

-- CreateIndex
CREATE INDEX "Questions_gameId_idx" ON "Questions"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "Questions_gameId_cardName_key" ON "Questions"("gameId", "cardName");

-- CreateIndex
CREATE UNIQUE INDEX "Questions_gameId_question_key" ON "Questions"("gameId", "question");

-- CreateIndex
CREATE INDEX "QuestionsSolved_playerId_idx" ON "QuestionsSolved"("playerId");

-- CreateIndex
CREATE INDEX "QuestionsSolved_questionId_idx" ON "QuestionsSolved"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionsSolved_playerId_questionId_key" ON "QuestionsSolved"("playerId", "questionId");

-- CreateIndex
CREATE INDEX "User_registerId_idx" ON "User"("registerId");

-- CreateIndex
CREATE INDEX "UserGame_language_idx" ON "UserGame"("language");

-- CreateIndex
CREATE INDEX "UserGame_user_idx" ON "UserGame"("user");

-- CreateIndex
CREATE INDEX "UserGameDetails_gameId_idx" ON "UserGameDetails"("gameId");

-- CreateIndex
CREATE INDEX "UserGameDetails_partyMode_idx" ON "UserGameDetails"("partyMode");

-- AddForeignKey
ALTER TABLE "QuestionsSolved" ADD CONSTRAINT "QuestionsSolved_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "GamePlayers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameRoomMessages" ADD CONSTRAINT "GameRoomMessages_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "GamePlayers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameRoomMessages" ADD CONSTRAINT "GameRoomMessages_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "GameRooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
