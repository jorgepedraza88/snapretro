/*
  Warnings:

  - You are about to drop the column `title` on the `retrospective_sections` table. All the data in the column will be lost.
  - Added the required column `name` to the `retrospective_sections` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `retrospectives` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "retrospective_sections" DROP COLUMN "title",
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "retrospectives" ADD COLUMN     "name" TEXT NOT NULL;
