import { prisma } from "@/lib/prisma";
import { Locale } from "@/i18n/config";

// Small helpers to pick localized content based on the locale.

export function localeText(field: { en?: string | null; ar?: string | null } | null | undefined, locale: Locale) {
  if (!field) return "";
  return locale === "ar" && field.ar ? field.ar : (field.en ?? "");
}

export async function getHomeData(locale: Locale) {
  const [categories, venues, certificates, courses, articles, clients] = await Promise.all([
    prisma.category.findMany({ where: { featured: true }, orderBy: { sort: "asc" }, take: 12 }),
    prisma.venue.findMany({ orderBy: { nameEn: "asc" }, take: 12, include: { region: true } }),
    prisma.certificate.findMany({ orderBy: { sort: "asc" }, take: 9 }),
    prisma.course.findMany({ where: { featured: true }, orderBy: { updatedAt: "desc" }, take: 10, include: { schedules: { include: { venue: true } } } }),
    prisma.article.findMany({ where: { status: "published" }, orderBy: { publishedAt: "desc" }, take: 4 }),
    prisma.client.findMany({ orderBy: { sort: "asc" } }),
  ]);
  return { categories, venues, certificates, courses, articles, clients };
}

export async function getNavigation(locale: Locale) {
  const [superCategories, regions, certificates, sectors] = await Promise.all([
    prisma.superCategory.findMany({ orderBy: { sort: "asc" }, include: { categories: true } }),
    prisma.region.findMany({ orderBy: { sort: "asc" }, include: { venues: true } }),
    prisma.certificate.findMany({ orderBy: { sort: "asc" } }),
    prisma.category.findMany({ orderBy: { nameEn: "asc" } }),
  ]);
  return { superCategories, regions, certificates, sectors };
}