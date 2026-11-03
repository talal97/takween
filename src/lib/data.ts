import { prisma } from "@/lib/prisma";
import { Locale } from "@/i18n/config";
import { unstable_cache } from "next/cache";

// A shared cache tag. Admin mutations that affect public content call
// `revalidateTag("site")` so public pages pick up changes promptly.
export const SITE_TAG = "site";

// Small helpers to pick localized content based on the locale.
export function localeText(field: { en?: string | null; ar?: string | null } | null | undefined, locale: Locale) {
  if (!field) return "";
  const preferred = locale === "ar" ? field.ar : field.en;
  const fallback = locale === "ar" ? field.en : field.ar;
  return preferred?.trim() ? preferred : (fallback ?? "");
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

  const [superCategories, regionsList, certificates, featured, articles, testimonials, clients, heroSlides, categoryCounts, totalCourses] =
    await Promise.all([
      prisma.superCategory.findMany({
        orderBy: { sort: "asc" },
        include: {
          categories: {
            orderBy: { nameEn: "asc" },
            where: { courses: { some: { locale: localeFilter } } },
            include: { _count: { select: { courses: { where: { locale: localeFilter } } } } },
          },
        },
      }),
      prisma.region.findMany({ orderBy: { sort: "asc" }, include: { venues: { orderBy: { nameEn: "asc" } } } }),
      prisma.certificate.findMany({ orderBy: { sort: "asc" }, take: 8 }),
      prisma.course.findMany({
        where: { featured: true, locale: localeFilter, schedules: { some: { endDate: { gte: new Date() } } } },
        orderBy: { updatedAt: "desc" },
        take: 6,
        include: { schedules: { where: { endDate: { gte: new Date() } }, orderBy: { startDate: "asc" }, include: { venue: true } }, category: true },
      }),
      prisma.article.findMany({ where: { status: "published", locale: localeFilter }, orderBy: { publishedAt: "desc" }, take: 3 }),
      prisma.testimonial.findMany({ where: { featured: true }, orderBy: { sort: "asc" }, take: 3 }),
      prisma.client.findMany({ orderBy: { sort: "asc" }, take: 12 }),
      prisma.heroSlide.findMany({ orderBy: { sort: "asc" } }),
      prisma.course.groupBy({ by: ["categoryId"], where: { locale: localeFilter }, _count: { _all: true } }),
      prisma.course.count({ where: { locale: localeFilter } }),
    ]);
  return {
    superCategories,
    regionsList,
    certificates,
    featured,
    articles,
    testimonials,
    clients,
    heroSlides,
    categoryCounts,
    totalCourses,
  };
}

export const getHomePageDataCached = unstable_cache(getHomePageData, ["home-page"], {
  revalidate: 300,
  tags: [SITE_TAG],
});

export async function getCountries() {
  const countries = await prisma.country.findMany({ orderBy: { sort: "asc" } });
  const venues = await prisma.venue.findMany({ select: { country: true } });
  const venueCountByCountry: Record<string, number> = {};
  venues.forEach((v) => {
    const key = v.country.trim().toLowerCase();
    venueCountByCountry[key] = (venueCountByCountry[key] || 0) + 1;
  });
  return countries.map((c) => {
    const lookup = c.nameEn.trim().toLowerCase();
    return { ...c, venueCount: venueCountByCountry[lookup] || 0 };
  });
}

export const getCountriesCached = unstable_cache(getCountries, ["countries-list"], {
  revalidate: 300,
  tags: [SITE_TAG],
});