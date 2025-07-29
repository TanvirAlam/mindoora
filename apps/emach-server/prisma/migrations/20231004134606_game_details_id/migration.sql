/*
  Warnings:

  - The primary key for the `UserGameDetails` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "UserGameDetails" DROP CONSTRAINT "UserGameDetails_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "UserGameDetails_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "UserGameDetails_id_seq";
