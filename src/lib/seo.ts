import { prisma } from "@/lib/prisma";
import { getSettingsCached } from "@/lib/settings";
import type { Metadata } from "next";

export function siteUrl(path = "") {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://takween.com").replace(/\/$/, "");
  return `${base}${path}`;
}

export function absoluteImage(src?: string | null) {
  if (!src) return undefined;
  if (/^https?:\/\//i.test(src)) return src;
  return siteUrl(src);
}

export async function getBrandName() {
  const settings = await getSettingsCached();
  return settings.brand_name || "Takween";
}

/**
 * JSON-LD for a course page. Combines a schema.org Course with the site's
 * Organization so search engines associate the provider.
 */
export async function courseJsonLd(input: { name: string; description?: string }) {
  const name = await getBrandName();
  return {
    "@context": "https://schema.org",
    "@type": ["Course", "Product"],
    name: input.name,
    description: input.description,
    provider: {
      "@type": "Organization",
      name,
      url: siteUrl("/"),
    },
    offers: { "@type": "Offer", category: "Training" },
  };
}

/** schema.org Organization markup for the whole site. */
export async function organizationJsonLd() {
  const name = await getBrandName();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url: siteUrl("/"),
  };
}

/** A future schedule rendered as a schema.org CourseInstance/Event hint. */
export async function courseEventSchedules(courseId: string) {
  const course = await prisma.course.findFirst({
    where: { id: courseId },
    select: {
      schedules: {
        select: {
          startDate: true,
          endDate: true,
          venue: { select: { nameEn: true, country: true } },
        },
      },
    },
  });
  return course?.schedules.map((s) => ({
    "@type": "CourseInstance" as const,
    startDate: s.startDate.toISOString(),
    endDate: s.endDate.toISOString(),
    location: { "@type": "Place", name: s.venue.nameEn, address: { "@type": "PostalAddress", addressCountry: s.venue.country } },
  }));
}

export function buildPageMetadata(opts: {
  title: string;
  description?: string;
  locale: string;
  path: string;
  image?: string;
  availableLocales?: readonly string[];
}): Metadata {
  const { title, description, locale, path, image } = opts;
  const brand = "Takween";
  const fullTitle = `${title} | ${brand}`;
  return {
    title: fullTitle,
    description,
    alternates: {
      canonical: siteUrl(`/${locale}${path}`),
      languages: Object.fromEntries((opts.availableLocales ?? ["en", "ar"]).map((language) => [language, `/${language}${path}`])),
    },
    openGraph: {
      title: fullTitle,
      description,
      url: siteUrl(`/${locale}${path}`),
      images: image ? [{ url: absoluteImage(image)! }] : undefined,
    },
  };
}
