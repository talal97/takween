CREATE TABLE "CaptchaUse" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CaptchaUse_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "CaptchaUse_expiresAt_idx" ON "CaptchaUse"("expiresAt");
