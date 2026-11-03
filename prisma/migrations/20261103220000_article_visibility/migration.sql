ALTER TABLE "Article" ADD COLUMN "locale" TEXT NOT NULL DEFAULT 'both';
CREATE INDEX "Article_locale_status_publishedAt_idx" ON "Article"("locale", "status", "publishedAt");
