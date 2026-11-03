import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { localeText } from "@/lib/data";
import { readableDate } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/site/page-header";
import { Breadcrumb } from "@/components/site/breadcrumb";
import { ShareButtons } from "@/components/site/share-buttons";
import { buildPageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const l = locale === "ar" ? "ar" : "en";
  const article = await prisma.article.findFirst({ where: { slug, status: "published", locale: { in: [l, "both"] } } });
  if (!article) return buildPageMetadata({ title: "Article", locale, path: `/resources/${slug}` });
  const title = localeText({ en: article.titleEn, ar: article.titleAr }, l);
  const description = localeText({ en: article.excerptEn, ar: article.excerptAr }, l);
  return buildPageMetadata({ title, description, locale, path: `/resources/${slug}`, image: article.image ?? undefined, availableLocales: article.locale === "both" ? ["en", "ar"] : [l] });
}

export default async function ResourcePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const l = (locale === "ar" ? "ar" : "en") as "en" | "ar";
  setRequestLocale(locale);
  const article = await prisma.article.findFirst({ where: { slug, status: "published", locale: { in: [l, "both"] } } });
  if (!article) notFound();

  return (
    <div>
      <Breadcrumb />
      <PageHeader title={localeText({ en: article.titleEn, ar: article.titleAr }, l)} />
      <article className="mx-auto max-w-3xl px-4 py-10">
        <Link href="/resources" className="text-sm font-medium text-brand hover:underline">
          ← {l === "ar" ? "الموارد" : "Resources"}
        </Link>
        <p className="mt-2 text-sm text-muted-foreground">{readableDate(article.publishedAt, l)}</p>
        <div className="mt-4">
          <ShareButtons
            title={localeText({ en: article.titleEn, ar: article.titleAr }, l)}
            description={localeText({ en: article.excerptEn, ar: article.excerptAr }, l)}
            path={`/${locale}/resources/${slug}`}
          />
        </div>
        <p className="mt-6 whitespace-pre-line leading-relaxed text-muted-foreground">{localeText({ en: article.bodyEn, ar: article.bodyAr }, l)}</p>
      </article>
    </div>
  );
}