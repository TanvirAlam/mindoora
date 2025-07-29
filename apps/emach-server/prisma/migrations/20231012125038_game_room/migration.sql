-- CreateEnum
CREATE TYPE "gameRole" AS ENUM ('admin', 'moderator', 'guest');

-- CreateTable
CREATE TABLE "GameRooms" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "inviteCode" TEXT NOT NULL,
    "isLive" BOOLEAN NOT NULL DEFAULT false,
    "user" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameRooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GamePlayers" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imgUrl" TEXT,
    "role" "gameRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GamePlayers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionsSolved" (
    "id" TEXT NOT NULL,
    "gamePlayerId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answered" BOOLEAN NOT NULL DEFAULT false,
    "isRight" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestionsSolved_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GameRooms_inviteCode_key" ON "GameRooms"("inviteCode");

-- AddForeignKey
ALTER TABLE "GameRooms" ADD CONSTRAINT "GameRooms_user_fkey" FOREIGN KEY ("user") REFERENCES "Register"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameRooms" ADD CONSTRAINT "GameRooms_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "UserGame"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GamePlayers" ADD CONSTRAINT "GamePlayers_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "GameRooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionsSolved" ADD CONSTRAINT "QuestionsSolved_gamePlayerId_fkey" FOREIGN KEY ("gamePlayerId") REFERENCES "GamePlayers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionsSolved" ADD CONSTRAINT "QuestionsSolved_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
