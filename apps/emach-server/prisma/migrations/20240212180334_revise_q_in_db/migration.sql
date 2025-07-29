/*
  Warnings:

  - The `incorrect_answers` column on the `QuestionDB` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `extra_incorrect_answers` column on the `QuestionDB` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "QuestionDB" DROP COLUMN "incorrect_answers",
ADD COLUMN     "incorrect_answers" TEXT[],
DROP COLUMN "extra_incorrect_answers",
ADD COLUMN     "extra_incorrect_answers" TEXT[];
