-- DropForeignKey
ALTER TABLE "UserGameDetails" DROP CONSTRAINT "UserGameDetails_rule_fkey";

-- DropIndex
DROP INDEX "GameRules_name_key";
