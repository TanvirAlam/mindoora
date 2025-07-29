-- CreateTable
CREATE TABLE "AcceptTC" (
    "id" TEXT NOT NULL,
    "timeOfAccept" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAdress" TEXT NOT NULL,
    "metadata" JSONB NOT NULL,
    "user" TEXT NOT NULL,

    CONSTRAINT "AcceptTC_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AcceptTC" ADD CONSTRAINT "AcceptTC_user_fkey" FOREIGN KEY ("user") REFERENCES "Register"("id") ON DELETE CASCADE ON UPDATE CASCADE;
