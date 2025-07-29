-- CreateTable
CREATE TABLE "gameExperience" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "totalQ" INTEGER NOT NULL,
    "timeTaken" INTEGER NOT NULL,
    "totalText" INTEGER NOT NULL,
    "lavelOfFun" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gameExperience_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "gameExperience" ADD CONSTRAINT "gameExperience_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "GameRooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
