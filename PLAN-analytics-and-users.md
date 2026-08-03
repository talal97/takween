# Plan: Admin User Management + Custom Analytics

## Feature 1: Admin User Management

### Prisma Schema Changes
Add to `prisma/schema.prisma`:
- No schema changes needed — `User` model already has `role`, `passwordHash`, etc.

### New Files

**`src/app/admin/(protected)/actions-users.ts`** — Server actions
- `"use server"` at top
- Zod schemas: `createUserSchema` (name, email, password, role), `updateUserSchema` (name, email, role — password optional)
- `createUser()` — bcrypt hash, check unique email, `revalidatePath("/admin/users")`
- `updateUser()` — update fields, `revalidatePath("/admin/users")`, `revalidatePath("/admin/users/[id]")`
- `deleteUser()` — prevent self-deletion, `revalidatePath("/admin/users")`
- `changePassword()` — separate action for password changes
- All actions require `role === "owner"` check (only owners can manage users)

**`src/components/admin/user-form.tsx`** — User form component
- `"use client"`, same pattern as `category-form.tsx`
- Fields: Name, Email, Role (select: admin/owner), Password (only on create or when changing)
- Reuses `DeleteInList` pattern

**`src/app/admin/(protected)/users/page.tsx`** — List page
- Server component, fetches all users via Prisma
- Table: Name, Email, Role, Created, Actions (Edit / Delete)
- Embedded "Add User" form at top
- Prevent deletion of the last owner

**`src/app/admin/(protected)/users/[id]/page.tsx`** — Edit page
- Same pattern as `categories/[id]/page.tsx`
- Shows user form with `initial={user}` populated
- Password change section (separate form)

### RBAC Changes

**`src/lib/require-admin.ts`** — Add `requireOwner()` helper
- Checks `session.user.role === "owner"`, redirects if not

**`src/components/admin/sidebar.tsx`** — Add "Users" nav entry (visible only to owners)

**`src/app/admin/(protected)/actions-helpers.ts`** — Export `requireOwner`

### Key Decisions
- Only owners can create/edit/delete admin users
- Admins can see the Users page but not modify (read-only or hidden)
- Password changes require current password confirmation
- Self-deletion is blocked
- Last owner cannot be deleted or downgraded

---

## Feature 2: Custom Self-Hosted Analytics

### Prisma Schema Changes
Add to `prisma/schema.prisma`:
```prisma
model PageView {
  id        String   @id @default(cuid())
  path      String
  locale    String   @default("en")
  referrer  String?
  userAgent String?
  ip        String?
  country   String?
  createdAt DateTime @default(now()) @db.Timestampture()

  @@index([path])
  @@index([createdAt])
}

model ClickEvent {
  id        String   @id @default(cuid())
  element   String   // "cta", "course_card", "nav_link", etc.
  path      String
  locale    String   @default("en")
  metadata  Json?
  createdAt DateTime @default(now()) @db.Timestampture()

  @@index([element])
  @@index([createdAt])
}
```

### New Files

**`src/app/api/analytics/pageview/route.ts`** — POST endpoint
- Receives: `{ path, locale, referrer }`
- Stores PageView record (server-side, no client IP exposure)
- Returns 204 No Content

**`src/app/api/analytics/click/route.ts`** — POST endpoint
- Receives: `{ element, path, locale, metadata }`
- Stores ClickEvent record
- Returns 204 No Content

**`src/components/analytics/tracker.tsx`** — Client-side tracker
- `"use client"` component
- `useEffect` to send pageview on route change (via `usePathname()`)
- `trackClick(element, metadata?)` function exported for manual use
- Uses `navigator.sendBeacon` for reliability (sends on page unload)
- Debounced to avoid duplicate pageviews

**`src/lib/analytics.ts`** — Server-side analytics queries
- `getPageViews(from, to, path?)` — aggregated page views
- `getTopPages(from, to, limit)` — most visited pages
- `getClickStats(from, to, element?)` — click event aggregation
- `getDailyVisits(from, to)` — daily visit counts for charts
- `getVisitsByLocale(from, to)` — locale breakdown
- `getTrafficSummary()` — today vs yesterday vs last 7 days

**`src/app/admin/(protected)/analytics/page.tsx`** — Analytics dashboard
- Date range selector (today, 7 days, 30 days, custom)
- Summary cards: Total Visits, Unique Pages, Top Page, Total Clicks
- Daily visits line chart (Recharts)
- Top pages table (path, views, percentage)
- Click events breakdown (element, count)
- Locale distribution (pie/donut chart)

**`src/components/admin/analytics-charts.tsx`** — Chart components
- `"use client"` components using Recharts
- `DailyVisitsChart` — line chart
- `LocaleBreakdownChart` — pie chart
- `ClickEventsChart` — bar chart

### Integration Points

**`src/app/[locale]/layout.tsx`** — Add `<Tracker />` component
- Only in production (check `NODE_ENV`)
- Non-blocking, uses `sendBeacon`

**`src/components/admin/sidebar.tsx`** — Add "Analytics" nav entry

### Charting Library
- Add `recharts` dependency (most popular React chart lib, works with SSR)
- Lightweight, tree-shakeable, good for dashboards

### Key Decisions
- Server-side tracking only (no client-side cookies/fingerprinting)
- No PII stored (no IP, no user agent stored in full)
- `sendBeacon` for reliability on page unload
- Recharts for visualization (mature, well-maintained)
- Date range filtering on all queries
- Analytics page is owner-only (or all admins — TBD)

---

## Implementation Order

1. **Admin User Management** (smaller scope, immediate value)
   - Server actions → Form component → List page → Edit page → RBAC → Sidebar
2. **Custom Analytics** (larger scope)
   - Schema → API routes → Tracker component → Server queries → Admin dashboard → Charts

## Verification
- After each feature: `npx tsc --noEmit`, `npx eslint`, `npx next build`
- Manual testing: create user, login as different roles, verify analytics tracking
