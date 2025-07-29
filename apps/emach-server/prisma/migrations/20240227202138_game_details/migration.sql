-- AlterTable
ALTER TABLE "UserGameDetails" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'none',
ADD COLUMN     "keyWords" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "theme" TEXT NOT NULL DEFAULT 'none';
