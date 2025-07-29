-- CreateTable
CREATE TABLE "userGameScore" (
    "score" INTEGER NOT NULL,
    "gameId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "userGameScore_pkey" PRIMARY KEY ("gameId","playerId")
);

-- CreateIndex
CREATE INDEX "userGameScore_gameId_idx" ON "userGameScore"("gameId");

-- CreateIndex
CREATE INDEX "userGameScore_playerId_idx" ON "userGameScore"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "userGameScore_gameId_playerId_key" ON "userGameScore"("gameId", "playerId");

-- AddForeignKey
ALTER TABLE "userGameScore" ADD CONSTRAINT "userGameScore_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "UserGame"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userGameScore" ADD CONSTRAINT "userGameScore_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "GamePlayers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
