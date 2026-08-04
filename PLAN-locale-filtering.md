# Plan: Locale-Based Course Filtering (Glomacs-Style Dual Catalog)

## Goal
Different courses, different counts, different featured content per locale — while keeping the same `/en/` and `/ar/` path structure and shared categories.

## Schema Changes

### Course Model — Add `locale` field
```prisma
locale  String  @default("both")  // "en" | "ar" | "both"
```
- `"en"` → English site only
- `"ar"` → Arabic site only
- `"both"` → appears on both (default, backward compatible)

### Migration
```bash
npx prisma db push
```
No data migration needed — existing courses default to `"both"`.

---

## Files to Modify

### 1. Prisma Schema
**File:** `prisma/schema.prisma`
- Add `locale` field to Course model

### 2. Server Actions — Course CRUD
**File:** `src/app/admin/(protected)/course-actions.ts`
- Add `locale` to `courseSchema` Zod validation
- Include `locale` in create/update payloads

### 3. Course Form — Admin UI
**File:** `src/components/admin/course-form.tsx`
- Add locale select dropdown (English / Arabic / Both)
- Show current locale in edit mode

### 4. Home Page — Locale-Filtered Queries
**File:** `src/lib/data.ts`
- `getHomePageData(locale)` — add locale parameter
- Filter courses: `where: { locale: { in: [locale, "both"] } }`
- Filter categories: only show categories that have at least one course for the locale
- Different `take` counts per locale (configurable or hardcoded)

**File:** `src/app/[locale]/page.tsx`
- Pass locale to `getHomePageDataCached(locale)`
- Display different course counts per locale section

### 5. Training Subjects Page — Filter by Locale
**File:** `src/app/[locale]/training-subjects/page.tsx`
- Filter super-categories: only show those with courses matching the locale
- Filter categories within each super-category

**File:** `src/app/[locale]/training-subjects/[slug]/page.tsx`
- Filter courses within a category by locale
- Show empty state if no courses for that locale in this category

### 6. Course Finder — Filter by Locale
**File:** `src/app/[locale]/course-finder/page.tsx`
- Add locale filter to the search query
- Only show courses matching the current locale

### 7. New Training Courses Page — Filter by Locale
**File:** `src/app/[locale]/new-training-courses/page.tsx`
- Filter by locale: `where: { locale: { in: [locale, "both"] } }`

### 8. Training Calendar — Filter by Locale
**File:** `src/app/[locale]/training-calendar/page.tsx`
- Filter schedules by course locale

### 9. Course Detail Page — Locale Guard
**File:** `src/app/[locale]/training-course/[slug]/page.tsx`
- After fetching course, check if `course.locale` matches current locale
- If course is `locale: "en"` and visitor is on `/ar/...`, show `notFound()`
- If course is `locale: "ar"` and visitor is on `/en/...`, show `notFound()`

### 10. Venue Pages — Filter by Locale
**File:** `src/app/[locale]/training/page.tsx`
**File:** `src/app/[locale]/training/[slug]/page.tsx`
- Filter schedules/courses by locale when showing venue details

### 11. Certificate Pages — Filter by Locale
**File:** `src/app/[locale]/certificates/page.tsx`
**File:** `src/app/[locale]/certified-courses/[slug]/page.tsx`
- Filter courses by locale

### 12. Sector-Specific Pages — Filter by Locale
**File:** `src/app/[locale]/training-subjects/sector-specific-training-courses/page.tsx`
- Filter by locale

### 13. Sitemap — Locale-Aware
**File:** `src/app/sitemap.ts`
- Only include course URLs for the correct locale
- English sitemap: only `locale: "en"` and `locale: "both"` courses
- Arabic sitemap: only `locale: "ar"` and `locale: "both"` courses

### 14. Cache Invalidation
**File:** `src/lib/data.ts`
- Update `getHomePageDataCached` cache key to include locale
- Or use separate cache keys per locale

---

## What Stays Shared (No Changes)
- Categories / SuperCategories (dual columns, filtered by having courses)
- Venues / Regions (shared)
- Certificates (shared)
- Articles / Testimonials / FAQs (shared, dual columns)
- Countries (shared)
- Clients (shared)
- Settings (shared)
- i18n routing (stays `/en/` and `/ar/`)

---

## Admin UX
- Course form gets a "Locale" dropdown: English Only / Arabic Only / Both
- Default is "Both" (backward compatible)
- Existing courses remain "Both" — no migration needed
- Admin can see which locale each course is assigned to in the list view

---

## Edge Cases
1. **Empty category** — A category with no courses for the current locale → hide it from navigation
2. **Course detail deep link** — If someone shares an English-only course link with an Arabic user → show 404 with a message suggesting the English version
3. **Search** — Course finder only returns courses for the current locale
4. **Registration form** — Should still work for any course regardless of locale (the form already stores locale)

---

## Implementation Order
1. Schema change + Prisma generate
2. Course actions (server actions)
3. Course form (admin UI)
4. Home page queries
5. Training subjects pages
6. Course finder
7. New courses page
8. Course detail page (locale guard)
9. Venue/certificate pages
10. Sitemap
11. Final verification (tsc, eslint, build)

## Verification
- `npx prisma db push` — create locale column
- `npx tsc --noEmit` — type check
- `npx eslint 'src/**/*.{ts,tsx}'` — lint
- `npx next build` — build check
- Manual test: Create a course with locale "en", verify it doesn't appear on `/ar/`
- Manual test: Create a course with locale "ar", verify it doesn't appear on `/en/`
- Manual test: Default "both" courses appear on both locales
