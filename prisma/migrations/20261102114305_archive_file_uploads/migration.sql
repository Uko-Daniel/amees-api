-- CreateTable
CREATE TABLE "ArchiveFile" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "course" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "kind" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "fileUrl" TEXT,
    "fileKey" TEXT,
    "sizeBytes" INTEGER NOT NULL DEFAULT 0,
    "sample" BOOLEAN NOT NULL DEFAULT false,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArchiveFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ArchiveFile_year_course_level_idx" ON "ArchiveFile"("year", "course", "level");
