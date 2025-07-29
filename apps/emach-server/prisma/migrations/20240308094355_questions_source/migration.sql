-- AlterTable
ALTER TABLE "Questions" ADD COLUMN     "qImage" TEXT,
ADD COLUMN     "qPoints" DOUBLE PRECISION,
ADD COLUMN     "qSource" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "qTrophy" TEXT;
