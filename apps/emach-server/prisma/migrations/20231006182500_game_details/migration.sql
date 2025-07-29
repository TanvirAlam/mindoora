/*
  Warnings:

  - A unique constraint covering the columns `[gameId]` on the table `UserGameDetails` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserGameDetails_gameId_key" ON "UserGameDetails"("gameId");
