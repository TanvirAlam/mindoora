/*
  Warnings:

  - The `status` column on the `Friends` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "fStatus" AS ENUM ('REQUESTED', 'ACCEPTED', 'REJECTED', 'BLOCKED', 'PENDING');

-- AlterTable
ALTER TABLE "Friends" DROP COLUMN "status",
ADD COLUMN     "status" "fStatus" NOT NULL DEFAULT 'REQUESTED';
