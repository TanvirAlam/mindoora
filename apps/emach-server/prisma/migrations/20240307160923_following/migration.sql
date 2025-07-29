-- CreateTable
CREATE TABLE "Followings" (
    "id" SERIAL NOT NULL,
    "followingId" TEXT NOT NULL,
    "followerId" TEXT NOT NULL,

    CONSTRAINT "Followings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Followings_followerId_idx" ON "Followings"("followerId");

-- CreateIndex
CREATE INDEX "Followings_followingId_idx" ON "Followings"("followingId");

-- AddForeignKey
ALTER TABLE "Followings" ADD CONSTRAINT "Followings_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "Register"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Followings" ADD CONSTRAINT "Followings_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "Register"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
