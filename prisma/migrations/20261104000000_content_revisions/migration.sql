CREATE TABLE "ContentRevision" (
  "id" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "actor" TEXT NOT NULL,
  "snapshot" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ContentRevision_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ContentRevision_kind_entityId_createdAt_idx" ON "ContentRevision"("kind", "entityId", "createdAt");
