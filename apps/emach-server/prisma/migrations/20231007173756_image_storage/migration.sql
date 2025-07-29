-- AlterTable
ALTER TABLE "Register" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "Images" (
    "id" TEXT NOT NULL,
    "imgName" TEXT NOT NULL,
    "user" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Images_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Images" ADD CONSTRAINT "Images_user_fkey" FOREIGN KEY ("user") REFERENCES "Register"("id") ON DELETE CASCADE ON UPDATE CASCADE;
