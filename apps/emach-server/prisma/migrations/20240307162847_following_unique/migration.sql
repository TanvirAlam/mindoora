/*
  Warnings:

  - A unique constraint covering the columns `[followerId,followingId]` on the table `Followings` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Followings_followerId_followingId_key" ON "Followings"("followerId", "followingId");
