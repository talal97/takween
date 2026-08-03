import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { locales } from "@/i18n/config";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://takween.com";

const STATIC_PATHS = [
  "",
  "about-us",
  "certificates",
  "contact-us",
  "course-finder",
  "new-training-courses",
  "resources",
  "training",
  "training-calendar",
  "training-subjects",
];

async function getDynamicSlugs() {
  const [courses, categories, articles, certificates] = await Promise.all([
    prisma.course.findMany({ select: { slug: true }, orderBy: { updatedAt: "desc" } }),
    prisma.category.findMany({ select: { slug: true, superCategoryId: true } }),
    prisma.article.findMany({ select: { slug: true }, where: { status: "published" } }),
    prisma.certificate.findMany({ select: { slug: true } }),
  ]);

  // Only categories attached to a super-category have their own listing page.
  const listingCategories = categories.filter((c) => c.superCategoryId);

  return { courses, categories: listingCategories, articles, certificates };
}

function url(path: string, locale: string) {
  return `${BASE_URL}/${locale}${path}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { courses, categories, articles, certificates } = await getDynamicSlugs();

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const p of STATIC_PATHS) {
      entries.push({
        url: url(p === "" ? "" : p, locale),
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: p === "" ? 1 : 0.7,
      });
    }

    for (const c of courses) {
      entries.push({
        url: url(`/training-course/${c.slug}`, locale),
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.8,
      });
    }

    // Category listing pages (only categories attached to a super-category have
    // their own listing page).
    for (const c of categories) {
      entries.push({
        url: url(`/training-courses/${c.slug}`, locale),
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }

    for (const c of certificates) {
      entries.push({
        url: url(`/certified-courses/${c.slug}`, locale),
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }

    for (const a of articles) {
      entries.push({
        url: url(`/resources/${a.slug}`, locale),
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.5,
      });
    }
  }

  return entries;
}