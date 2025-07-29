-- AlterTable
ALTER TABLE "Feedback" ALTER COLUMN "isActive" SET DEFAULT true;

-- CreateTable
CREATE TABLE "FeedbackGame" (
    "id" SERIAL NOT NULL,
    "score" INTEGER NOT NULL,
    "feedback" TEXT,
    "gameId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeedbackGame_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FeedbackGame_gameId_idx" ON "FeedbackGame"("gameId");

-- CreateIndex
CREATE INDEX "FeedbackGame_playerId_idx" ON "FeedbackGame"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "FeedbackGame_gameId_playerId_key" ON "FeedbackGame"("gameId", "playerId");

-- AddForeignKey
ALTER TABLE "FeedbackGame" ADD CONSTRAINT "FeedbackGame_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "UserGame"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackGame" ADD CONSTRAINT "FeedbackGame_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "GamePlayers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
