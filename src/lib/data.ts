import { prisma } from "@/lib/prisma";
import { Locale } from "@/i18n/config";
import { unstable_cache } from "next/cache";

// A shared cache tag. Admin mutations that affect public content call
// `revalidateTag("site")` so public pages pick up changes promptly.
export const SITE_TAG = "site";

// Small helpers to pick localized content based on the locale.
export function localeText(field: { en?: string | null; ar?: string | null } | null | undefined, locale: Locale) {
  if (!field) return "";
  return locale === "ar" && field.ar ? field.ar : (field.en ?? "");
}

// The navigation structure shown in headers/footers is identical for both
// locales (localization happens at render time), so it is cached once.
export async function getNavigation() {
  const [superCategories, regions, certificates, sectors] = await Promise.all([
    prisma.superCategory.findMany({ orderBy: { sort: "asc" }, include: { categories: true } }),
    prisma.region.findMany({ orderBy: { sort: "asc" }, include: { venues: true } }),
    prisma.certificate.findMany({ orderBy: { sort: "asc" } }),
    prisma.category.findMany({ orderBy: { nameEn: "asc" } }),
  ]);
  return { superCategories, regions, certificates, sectors };
}

export const getNavigationCached = unstable_cache(getNavigation, ["navigation"], {
  revalidate: 300,
  tags: [SITE_TAG],
});

export async function getHomePageData(locale: Locale = "en") {
  const localeFilter = locale === "ar" ? { in: ["ar", "both"] } : { in: ["en", "both"] };

  const [categories, regionsList, certificates, featured, articles, testimonials, clients, categoryCounts, totalCourses] =
    await Promise.all([
      prisma.category.findMany({ where: { featured: true, courses: { some: { locale: localeFilter } } }, orderBy: { sort: "asc" }, take: 12 }),
      prisma.region.findMany({ orderBy: { sort: "asc" }, include: { venues: { orderBy: { nameEn: "asc" } } } }),
      prisma.certificate.findMany({ orderBy: { sort: "asc" }, take: 8 }),
      prisma.course.findMany({
        where: { featured: true, locale: localeFilter },
        orderBy: { updatedAt: "desc" },
        take: 6,
        include: { schedules: { orderBy: { startDate: "asc" }, include: { venue: true } }, category: true },
      }),
      prisma.article.findMany({ where: { status: "published" }, orderBy: { publishedAt: "desc" }, take: 3 }),
      prisma.testimonial.findMany({ where: { featured: true }, orderBy: { sort: "asc" }, take: 3 }),
      prisma.client.findMany({ orderBy: { sort: "asc" }, take: 12 }),
      prisma.course.groupBy({ by: ["categoryId"], where: { locale: localeFilter }, _count: { _all: true } }),
      prisma.course.count({ where: { locale: localeFilter } }),
    ]);
  return {
    categories,
    regionsList,
    certificates,
    featured,
    articles,
    testimonials,
    clients,
    categoryCounts,
    totalCourses,
  };
}

export const getHomePageDataCached = unstable_cache(getHomePageData, ["home-page"], {
  revalidate: 300,
  tags: [SITE_TAG],
});