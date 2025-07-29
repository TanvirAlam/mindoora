/*
  Warnings:

  - Added the required column `point` to the `QuestionsSolved` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "QuestionsSolved" ADD COLUMN     "point" DOUBLE PRECISION NOT NULL;
