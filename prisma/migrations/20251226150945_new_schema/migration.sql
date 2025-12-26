/*
  Warnings:

  - You are about to drop the `Retrospective` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RetrospectivePost` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RetrospectiveSection` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "RetrospectivePost" DROP CONSTRAINT "RetrospectivePost_sectionId_fkey";

-- DropForeignKey
ALTER TABLE "RetrospectiveSection" DROP CONSTRAINT "RetrospectiveSection_retrospectiveId_fkey";

-- DropTable
DROP TABLE "Retrospective";

-- DropTable
DROP TABLE "RetrospectivePost";

-- DropTable
DROP TABLE "RetrospectiveSection";

-- CreateTable
CREATE TABLE "retrospectives" (
    "id" TEXT NOT NULL,
    "admin_id" TEXT NOT NULL,
    "avatar_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" TIMESTAMP(3),
    "settings" JSONB NOT NULL DEFAULT '{}',
    "secret_word" TEXT,
    "status" TEXT NOT NULL,

    CONSTRAINT "retrospectives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "retrospective_sections" (
    "id" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "retrospective_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "retrospective_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "retrospective_posts" (
    "id" TEXT NOT NULL,
    "section_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "votes" TEXT[],

    CONSTRAINT "retrospective_posts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "retrospectives_admin_id_idx" ON "retrospectives"("admin_id");

-- CreateIndex
CREATE INDEX "retrospective_sections_retrospective_id_idx" ON "retrospective_sections"("retrospective_id");

-- CreateIndex
CREATE INDEX "retrospective_posts_section_id_idx" ON "retrospective_posts"("section_id");

-- CreateIndex
CREATE INDEX "retrospective_posts_user_id_idx" ON "retrospective_posts"("user_id");

-- AddForeignKey
ALTER TABLE "retrospective_sections" ADD CONSTRAINT "retrospective_sections_retrospective_id_fkey" FOREIGN KEY ("retrospective_id") REFERENCES "retrospectives"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retrospective_posts" ADD CONSTRAINT "retrospective_posts_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "retrospective_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
