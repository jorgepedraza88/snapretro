/*
  Warnings:

  - Added the required column `status` to the `Retrospective` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Retrospective" ADD COLUMN     "status" TEXT NOT NULL;
