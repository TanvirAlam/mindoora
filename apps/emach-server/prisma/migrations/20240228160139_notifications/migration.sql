/*
  Warnings:

  - The primary key for the `Notifications` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `to` on the `Notifications` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Notifications" DROP CONSTRAINT "Notifications_to_fkey";

-- DropIndex
DROP INDEX "Notifications_to_idx";

-- AlterTable
ALTER TABLE "Notifications" DROP CONSTRAINT "Notifications_pkey",
DROP COLUMN "to",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Notifications_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Notifications_id_seq";

-- CreateTable
CREATE TABLE "NRecipients" (
    "id" SERIAL NOT NULL,
    "notificationId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,

    CONSTRAINT "NRecipients_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NRecipients_recipientId_idx" ON "NRecipients"("recipientId");

-- CreateIndex
CREATE UNIQUE INDEX "NRecipients_notificationId_recipientId_key" ON "NRecipients"("notificationId", "recipientId");

-- AddForeignKey
ALTER TABLE "NRecipients" ADD CONSTRAINT "NRecipients_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notifications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NRecipients" ADD CONSTRAINT "NRecipients_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "Register"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
