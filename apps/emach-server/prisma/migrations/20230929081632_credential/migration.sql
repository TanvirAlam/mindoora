/*
  Warnings:

  - You are about to drop the column `emailValidationToken` on the `Register` table. All the data in the column will be lost.
  - You are about to drop the column `expireTime` on the `Register` table. All the data in the column will be lost.
  - You are about to drop the column `isEmailVerified` on the `Register` table. All the data in the column will be lost.
  - You are about to drop the column `lastLogin` on the `Register` table. All the data in the column will be lost.
  - You are about to drop the column `otp` on the `Register` table. All the data in the column will be lost.
  - You are about to drop the `Todo` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `verified` to the `Register` table without a default value. This is not possible if the table is not empty.
  - Made the column `phone` on table `Register` required. This step will fail if there are existing NULL values in that column.
  - Made the column `role` on table `Register` required. This step will fail if there are existing NULL values in that column.
  - Made the column `accessToken` on table `Register` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_registerId_fkey";

-- DropIndex
DROP INDEX "Register_emailValidationToken_key";

-- AlterTable
ALTER TABLE "Register" DROP COLUMN "emailValidationToken",
DROP COLUMN "expireTime",
DROP COLUMN "isEmailVerified",
DROP COLUMN "lastLogin",
DROP COLUMN "otp",
ADD COLUMN     "verified" BOOLEAN NOT NULL,
ALTER COLUMN "phone" SET NOT NULL,
ALTER COLUMN "role" SET NOT NULL,
ALTER COLUMN "accessToken" SET NOT NULL;

-- DropTable
DROP TABLE "Todo";

-- CreateTable
CREATE TABLE "LoginHistory" (
    "id" SERIAL NOT NULL,
    "loginTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "LoginHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailVerify" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "code" INTEGER NOT NULL,
    "expireAt" TIMESTAMP(3) NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailVerify_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_registerId_fkey" FOREIGN KEY ("registerId") REFERENCES "Register"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoginHistory" ADD CONSTRAINT "LoginHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Register"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailVerify" ADD CONSTRAINT "EmailVerify_email_fkey" FOREIGN KEY ("email") REFERENCES "Register"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
