-- CreateTable
CREATE TABLE "QuestionDB" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "correct_answer" TEXT NOT NULL,
    "incorrect_answers" TEXT NOT NULL,
    "extra_incorrect_answers" TEXT NOT NULL,
    "user" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestionDB_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QuestionDB_type_idx" ON "QuestionDB"("type");

-- CreateIndex
CREATE INDEX "QuestionDB_question_idx" ON "QuestionDB"("question");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionDB_question_key" ON "QuestionDB"("question");

-- AddForeignKey
ALTER TABLE "QuestionDB" ADD CONSTRAINT "QuestionDB_user_fkey" FOREIGN KEY ("user") REFERENCES "Register"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
