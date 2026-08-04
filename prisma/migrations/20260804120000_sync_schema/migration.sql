-- DropIndex
DROP INDEX "Course_slug_key";

-- AlterTable
ALTER TABLE "Country" ADD COLUMN     "flag" TEXT;

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "locale" TEXT NOT NULL DEFAULT 'both',
ALTER COLUMN "titleEn" DROP NOT NULL;

-- CreateTable
CREATE TABLE "PageView" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "referrer" TEXT,
    "userAgent" TEXT,
    "country" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PageView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClickEvent" (
    "id" TEXT NOT NULL,
    "element" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClickEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PageView_path_idx" ON "PageView"("path");

-- CreateIndex
CREATE INDEX "PageView_createdAt_idx" ON "PageView"("createdAt");

-- CreateIndex
CREATE INDEX "PageView_createdAt_path_idx" ON "PageView"("createdAt", "path");

-- CreateIndex
CREATE INDEX "ClickEvent_element_idx" ON "ClickEvent"("element");

-- CreateIndex
CREATE INDEX "ClickEvent_createdAt_idx" ON "ClickEvent"("createdAt");

-- CreateIndex
CREATE INDEX "ClickEvent_createdAt_element_idx" ON "ClickEvent"("createdAt", "element");

-- CreateIndex
CREATE UNIQUE INDEX "Course_slug_locale_key" ON "Course"("slug", "locale");
