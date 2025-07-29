/*
  Warnings:

  - The values [BLOCKED] on the enum `fStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `group` on the `Friends` table. All the data in the column will be lost.
  - You are about to drop the column `isBlocked` on the `Friends` table. All the data in the column will be lost.
  - You are about to drop the column `isFavorite` on the `Friends` table. All the data in the column will be lost.
  - You are about to drop the column `isPrivate` on the `Friends` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Friends` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Friends` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "fStatus_new" AS ENUM ('REQUESTED', 'ACCEPTED', 'REJECTED', 'PENDING');
ALTER TABLE "Friends" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Friends" ALTER COLUMN "status" TYPE "fStatus_new" USING ("status"::text::"fStatus_new");
ALTER TYPE "fStatus" RENAME TO "fStatus_old";
ALTER TYPE "fStatus_new" RENAME TO "fStatus";
DROP TYPE "fStatus_old";
ALTER TABLE "Friends" ALTER COLUMN "status" SET DEFAULT 'REQUESTED';
COMMIT;

-- AlterTable
ALTER TABLE "Friends" DROP COLUMN "group",
DROP COLUMN "isBlocked",
DROP COLUMN "isFavorite",
DROP COLUMN "isPrivate",
DROP COLUMN "notes",
ADD COLUMN     "groupF" TEXT[] DEFAULT ARRAY['general']::TEXT[],
ADD COLUMN     "groupU" TEXT[] DEFAULT ARRAY['general']::TEXT[],
ADD COLUMN     "isBlockedF" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isBlockedU" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isFavoriteF" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isFavoriteU" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPrivateF" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPrivateU" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notesF" TEXT,
ADD COLUMN     "notesU" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
