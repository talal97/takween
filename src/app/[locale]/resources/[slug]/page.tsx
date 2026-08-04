import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { localeText } from "@/lib/data";
import { readableDate } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/site/page-header";

export default async function ResourcePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const l = (locale === "ar" ? "ar" : "en") as "en" | "ar";
  setRequestLocale(locale);
  const article = await prisma.article.findUnique({ where: { slug } });
  if (!article) notFound();

  return (
    <div>
      <PageHeader title={localeText({ en: article.titleEn, ar: article.titleAr }, l)} />
      <article className="mx-auto max-w-3xl px-4 py-10">
        <Link href="/resources" className="text-sm font-medium text-brand hover:underline">
          ← {l === "ar" ? "الموارد" : "Resources"}
        </Link>
        <p className="mt-2 text-sm text-muted-foreground">{readableDate(article.publishedAt, l)}</p>
        <p className="mt-6 leading-relaxed text-muted-foreground">{localeText({ en: article.bodyEn, ar: article.bodyAr }, l)}</p>
      </article>
    </div>
  );
}