/*
  Warnings:

  - Added the required column `timeLimit` to the `QuestionsSolved` table without a default value. This is not possible if the table is not empty.
  - Added the required column `timeTaken` to the `QuestionsSolved` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Questions" ADD COLUMN     "timeLimit" INTEGER NOT NULL DEFAULT 60;

-- AlterTable
ALTER TABLE "QuestionsSolved" ADD COLUMN     "timeLimit" INTEGER NOT NULL,
ADD COLUMN     "timeTaken" INTEGER NOT NULL;
