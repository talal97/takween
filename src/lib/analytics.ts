import { prisma } from "@/lib/prisma";

export type DateRange = { from: Date; to: Date };

function defaultRange(): DateRange {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return { from, to };
}

export async function getTotalPageViews(range?: DateRange) {
  const r = range ?? defaultRange();
  return prisma.pageView.count({ where: { createdAt: { gte: r.from, lte: r.to } } });
}

export async function getTotalClicks(range?: DateRange) {
  const r = range ?? defaultRange();
  return prisma.clickEvent.count({ where: { createdAt: { gte: r.from, lte: r.to } } });
}

export async function getUniquePages(range?: DateRange) {
  const r = range ?? defaultRange();
  const result = await prisma.$queryRaw<Array<{ path: string }>>`
    SELECT DISTINCT path FROM page_views
    WHERE created_at >= ${r.from} AND created_at <= ${r.to}
  `;
  return result.length;
}

export async function getTopPages(range?: DateRange, limit = 10) {
  const r = range ?? defaultRange();
  const result = await prisma.$queryRaw<Array<{ path: string; count: bigint }>>`
    SELECT path, COUNT(*) as count FROM page_views
    WHERE created_at >= ${r.from} AND created_at <= ${r.to}
    GROUP BY path
    ORDER BY count DESC
    LIMIT ${limit}
  `;
  return result.map((row) => ({ path: row.path, views: Number(row.count) }));
}

export async function getDailyVisits(range?: DateRange) {
  const r = range ?? defaultRange();
  const results = await prisma.$queryRaw<Array<{ date: string; count: bigint }>>`
    SELECT DATE(created_at) as date, COUNT(*) as count
    FROM page_views
    WHERE created_at >= ${r.from} AND created_at <= ${r.to}
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `;
  return results.map((row) => ({ date: row.date, count: Number(row.count) }));
}

export async function getLocaleBreakdown(range?: DateRange) {
  const r = range ?? defaultRange();
  const result = await prisma.$queryRaw<Array<{ locale: string; count: bigint }>>`
    SELECT locale, COUNT(*) as count FROM page_views
    WHERE created_at >= ${r.from} AND created_at <= ${r.to}
    GROUP BY locale
    ORDER BY count DESC
  `;
  return result.map((row) => ({ locale: row.locale, count: Number(row.count) }));
}

export async function getClickBreakdown(range?: DateRange, limit = 10) {
  const r = range ?? defaultRange();
  const result = await prisma.$queryRaw<Array<{ element: string; count: bigint }>>`
    SELECT element, COUNT(*) as count FROM click_events
    WHERE created_at >= ${r.from} AND created_at <= ${r.to}
    GROUP BY element
    ORDER BY count DESC
    LIMIT ${limit}
  `;
  return result.map((row) => ({ element: row.element, count: Number(row.count) }));
}

export async function getTrafficSummary() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [todayViews, yesterdayViews, weekViews, totalViews] = await Promise.all([
    prisma.pageView.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.pageView.count({ where: { createdAt: { gte: yesterdayStart, lt: todayStart } } }),
    prisma.pageView.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.pageView.count(),
  ]);

  return { todayViews, yesterdayViews, weekViews, totalViews };
}
