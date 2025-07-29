/*
  Warnings:

  - You are about to alter the column `point` on the `QuestionsSolved` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "QuestionsSolved" ALTER COLUMN "point" SET DATA TYPE INTEGER;
