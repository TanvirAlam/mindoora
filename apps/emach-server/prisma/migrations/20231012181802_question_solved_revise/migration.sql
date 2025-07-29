/*
  Warnings:

  - You are about to drop the column `answered` on the `QuestionsSolved` table. All the data in the column will be lost.
  - Added the required column `answer` to the `QuestionsSolved` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rightAnswer` to the `QuestionsSolved` table without a default value. This is not possible if the table is not empty.
  - Made the column `isRight` on table `QuestionsSolved` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "QuestionsSolved" DROP COLUMN "answered",
ADD COLUMN     "answer" TEXT NOT NULL,
ADD COLUMN     "rightAnswer" TEXT NOT NULL,
ALTER COLUMN "isRight" SET NOT NULL;
