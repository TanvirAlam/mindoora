/*
  Warnings:

  - You are about to drop the `Game` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Question` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "EmailVerify" DROP CONSTRAINT "EmailVerify_email_fkey";

-- DropForeignKey
ALTER TABLE "Game" DROP CONSTRAINT "Game_userId_fkey";

-- DropForeignKey
ALTER TABLE "LoginHistory" DROP CONSTRAINT "LoginHistory_userId_fkey";

-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_gameId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_registerId_fkey";

-- DropTable
DROP TABLE "Game";

-- DropTable
DROP TABLE "Question";

-- CreateTable
CREATE TABLE "Languages" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "imgUrl" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL,

    CONSTRAINT "Languages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardNames" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL,

    CONSTRAINT "CardNames_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartyModes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL,

    CONSTRAINT "PartyModes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameRules" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL,

    CONSTRAINT "GameRules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserGame" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "nPlayer" INTEGER NOT NULL,
    "cards" JSONB[],
    "user" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserGame_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserGameDetails" (
    "id" SERIAL NOT NULL,
    "gameId" TEXT NOT NULL,
    "imgUrl" TEXT NOT NULL,
    "description" TEXT,
    "partyMode" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL,
    "rule" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserGameDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Questions" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "cardName" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" INTEGER,
    "option1" TEXT,
    "option2" TEXT,
    "option3" TEXT,
    "option4" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Questions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Languages_name_key" ON "Languages"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Languages_imgUrl_key" ON "Languages"("imgUrl");

-- CreateIndex
CREATE UNIQUE INDEX "Languages_shortName_key" ON "Languages"("shortName");

-- CreateIndex
CREATE UNIQUE INDEX "CardNames_name_key" ON "CardNames"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PartyModes_name_key" ON "PartyModes"("name");

-- CreateIndex
CREATE UNIQUE INDEX "GameRules_name_key" ON "GameRules"("name");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_registerId_fkey" FOREIGN KEY ("registerId") REFERENCES "Register"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoginHistory" ADD CONSTRAINT "LoginHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Register"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailVerify" ADD CONSTRAINT "EmailVerify_email_fkey" FOREIGN KEY ("email") REFERENCES "Register"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGame" ADD CONSTRAINT "UserGame_language_fkey" FOREIGN KEY ("language") REFERENCES "Languages"("shortName") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGame" ADD CONSTRAINT "UserGame_user_fkey" FOREIGN KEY ("user") REFERENCES "Register"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGameDetails" ADD CONSTRAINT "UserGameDetails_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "UserGame"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGameDetails" ADD CONSTRAINT "UserGameDetails_partyMode_fkey" FOREIGN KEY ("partyMode") REFERENCES "PartyModes"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGameDetails" ADD CONSTRAINT "UserGameDetails_rule_fkey" FOREIGN KEY ("rule") REFERENCES "GameRules"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Questions" ADD CONSTRAINT "Questions_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "UserGame"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Questions" ADD CONSTRAINT "Questions_cardName_fkey" FOREIGN KEY ("cardName") REFERENCES "CardNames"("name") ON DELETE RESTRICT ON UPDATE CASCADE;
