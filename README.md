This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


## Releasing the November 2026 fixes

These changes require a database migration and invalidate existing admin sessions.

1. Back up the production database and uploads.
2. Set a new, random runtime `AUTH_SECRET` (at least 32 characters). Do not pass production secrets as Docker build arguments. The image no longer provides a fallback runtime secret.
3. Build the updated image and run `prisma migrate deploy` against the production database before starting it. The new `CaptchaUse` table is required for contact and registration submissions. For the production Compose stack, run `docker compose -f docker-compose.prod.yml build app`, then `docker compose -f docker-compose.prod.yml run --rm app node node_modules/prisma/build/index.js migrate deploy`, then start the updated app.
4. Rotate the owner password that was exposed by the removed `/api/setup` route. Keep the application inaccessible to public traffic until that password has been changed. Bootstrap a fresh installation only with the existing seed command and explicitly supplied, unique `ADMIN_EMAIL`/`ADMIN_PASSWORD` values.
5. Confirm `/api/setup` is unavailable, drafts show the not-found page without exposing content, admin login works, and contact/registration submissions succeed.
6. Create or edit one Arabic-only course, one English-only course and one course visible in both languages. Check the matching public catalogues, detail sections and translated outlines. Course codes must be unique and nonempty. Homepage featured cards additionally require an upcoming session.

Articles have an English-only, Arabic-only, or both-websites visibility selector. Apply the `20261103220000_article_visibility` migration before running the updated app. Existing articles default to both websites; missing translations in that mode fall back to the available language. Drafts remain private. Verify article listings, detail URLs, and sitemap entries in each selected language.

## Admin editing coverage

Courses and articles support independent website visibility. Switching languages keeps the other translation, and the site-content language selector only changes which fields are shown while editing. Course homepage cards also require an upcoming session.

The admin includes forms for courses and schedules, categories, venues and regions, certificates, articles, testimonials, FAQs, videos and downloads, slides, client logos and providers, submissions, bilingual site content, theme settings, contact details, payment methods, and SMTP. User management is restricted to owners. Course badges, certificate notes, and search titles are editable and used by the public pages.

Admin → Interface Text edits 88 English and Arabic labels for navigation, shared buttons, course headings, and registration forms. Search or filter by section, edit each language independently, and save each language separately. Blank overrides restore the bundled default. Only changed fields are saved, and changes invalidate the public cache. Mobile and desktop navigation use the same translations. Settings → Site Contact Info also includes separate English and Arabic brand names, used in the header, mobile menu, and footer.

This is not a full page builder: page structure, link destinations, interface text outside the editor's supported sections, registration salutation choices, and email templates remain code-managed. Shared taxonomy and site settings do not have per-record website visibility. System timestamps and internal identifiers are managed automatically. The interface editor uses the existing settings table and requires no additional database migration.

Local review credentials and database settings belong in ignored `.env.local` files and must never be copied to production.

## Preview, revisions, and unsaved edits

Course and article editors include a private content preview with English/Arabic and mobile/desktop width controls. It renders the current unsaved text, outlines, and course sessions without writing to the database or publishing a draft. It is a content review, not a complete interactive copy of the public page: navigation and registration are excluded.

Run `prisma migrate deploy` before starting this version: `20261104000000_content_revisions` creates the required revision table. On each course/article editor update, the previous saved record is captured in the same transaction. Course snapshots include both outlines, schedules, certificates, related courses, and both translations. Article snapshots include both translations and publishing settings. The history panel displays the latest 50 snapshots; older snapshots remain stored. Revisions begin with updates made after this feature is installed; imports and direct database changes are not covered, and deleted records cannot be recovered through this UI.

Review a version before choosing Restore and confirming it. Restoring replaces both languages and visibility settings, so a previously published version can become public again. The current saved version is backed up first. If a referenced category, venue, certificate, or related course no longer exists, the whole restore rolls back. History and restore actions require an authenticated admin. Preview data is kept in the editor and is not exposed through public draft URLs.

Main content, taxonomy, settings, user, and submission-note forms protect unsaved edits. In-app navigation, switching records, cancel, and sign-out prompt in both languages. Browser refresh/close uses the browser's standard warning. Successful saves clear only that form's warning; failed saves/restores leave the edits protected. Interface Text still saves each language separately. This is a warning system, not autosave: browser crashes cannot recover unsaved drafts.

## Dependency security maintenance

Use `npm ci` to install the reviewed lockfile, then run `npm run security:check`, `npm test`, `npm run lint`, and `npm run build` before releasing dependency updates.

The dependency overrides deliberately keep Next 15 and Prisma 6 while selecting patched PostCSS, sharp, and deepmerge-ts releases. The SWC helpers patch keeps the lockfile installable with both Docker's npm 10 and local npm 11. Nodemailer is overridden to the same patched version used by the app because Auth.js's optional email-provider peer range still requests older versions; this app uses credential login. Regression checks cover login, Prisma generation, image processing, and SMTP delivery to a local test server.

Spreadsheet exports use `write-excel-file` instead of ExcelJS's outdated archive dependencies. Exported content stays explicitly typed as text or numbers; user text is never interpreted as a formula.

Older lint plugins expect `require('minimatch')` to be callable. `vendor/minimatch-compat` exposes the patched upstream minimatch 11 callable and named APIs without retaining the older matching implementation. Keep `vendor` in Docker builds and copied distributions. Remove this compatibility override when all lint dependencies support the patched API directly. Do not replace it with an override to a modern minimatch object export: that breaks older plugins.
