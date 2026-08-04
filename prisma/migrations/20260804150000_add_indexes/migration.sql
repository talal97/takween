-- CreateIndex
CREATE INDEX "Schedule_courseId_idx" ON "Schedule"("courseId");

CREATE INDEX "Schedule_venueId_idx" ON "Schedule"("venueId");

CREATE INDEX "Schedule_startDate_idx" ON "Schedule"("startDate");

CREATE INDEX "Schedule_courseId_active_idx" ON "Schedule"("courseId", "active");

CREATE INDEX "Schedule_active_startDate_idx" ON "Schedule"("active", "startDate");

-- CreateIndex
CREATE INDEX "Course_categoryId_idx" ON "Course"("categoryId");

CREATE INDEX "Course_featured_createdAt_idx" ON "Course"("featured", "createdAt");

CREATE INDEX "Course_locale_idx" ON "Course"("locale");

-- CreateIndex
CREATE INDEX "Article_status_publishedAt_idx" ON "Article"("status", "publishedAt");

CREATE INDEX "Article_publishedAt_idx" ON "Article"("publishedAt");

-- CreateIndex
CREATE INDEX "Registration_email_createdAt_idx" ON "Registration"("email", "createdAt");

CREATE INDEX "Registration_status_createdAt_idx" ON "Registration"("status", "createdAt");

CREATE INDEX "Registration_countryIso_createdAt_idx" ON "Registration"("countryIso", "createdAt");

CREATE INDEX "Registration_createdAt_idx" ON "Registration"("createdAt");
