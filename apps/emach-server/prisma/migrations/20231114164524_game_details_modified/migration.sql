-- AlterTable
ALTER TABLE "UserGameDetails" ALTER COLUMN "imgUrl" DROP NOT NULL,
ALTER COLUMN "isPublic" SET DEFAULT true;
