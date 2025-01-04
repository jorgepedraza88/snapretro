-- CreateTable
CREATE TABLE "Retrospective" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "adminName" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "timer" INTEGER NOT NULL,
    "allowVotes" BOOLEAN NOT NULL,
    "enableChat" BOOLEAN NOT NULL,
    "enablePassword" BOOLEAN NOT NULL,
    "password" TEXT,

    CONSTRAINT "Retrospective_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RetrospectiveSection" (
    "id" TEXT NOT NULL,
    "retrospectiveId" TEXT NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "RetrospectiveSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RetrospectivePost" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "votes" TEXT[],

    CONSTRAINT "RetrospectivePost_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RetrospectiveSection" ADD CONSTRAINT "RetrospectiveSection_retrospectiveId_fkey" FOREIGN KEY ("retrospectiveId") REFERENCES "Retrospective"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetrospectivePost" ADD CONSTRAINT "RetrospectivePost_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "RetrospectiveSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
