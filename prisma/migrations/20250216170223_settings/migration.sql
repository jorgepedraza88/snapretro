-- AlterTable
ALTER TABLE "Retrospective" ADD COLUMN     "allowMessages" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "allowVotes" SET DEFAULT true;
