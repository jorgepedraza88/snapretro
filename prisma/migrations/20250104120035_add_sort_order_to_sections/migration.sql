/*
  Warnings:

  - Added the required column `sortOrder` to the `RetrospectiveSection` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RetrospectiveSection" ADD COLUMN     "sortOrder" INTEGER NOT NULL;
