import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { localeText } from "@/lib/data";
import { formatDateRange, formatCurrency } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { CalendarDays, Globe2 } from "lucide-react";
import { Breadcrumb } from "@/components/site/breadcrumb";
import { buildPageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const l = locale === "ar" ? "ar" : "en";
  const superCat = await prisma.superCategory.findUnique({ where: { slug } });
  if (superCat) {
    const title = localeText({ en: superCat.nameEn, ar: superCat.nameAr }, l);
    return buildPageMetadata({ title, locale, path: `/training-subjects/${slug}` });
  }
  const category = await prisma.category.findUnique({ where: { slug } });
  if (category) {
    const title = localeText({ en: category.nameEn, ar: category.nameAr }, l);
    return buildPageMetadata({ title, locale, path: `/training-subjects/${slug}` });
  }
  return buildPageMetadata({ title: "Training Subject", locale, path: `/training-subjects/${slug}` });
}

export default async function TrainingSubjectPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const l = (locale === "ar" ? "ar" : "en") as "en" | "ar";
  setRequestLocale(locale);

  const superCat = await prisma.superCategory.findUnique({
    where: { slug },
    include: { categories: true },
  });

  if (superCat) {
    const localeFilter = l === "ar" ? { in: ["ar", "both"] } : { in: ["en", "both"] };
    const filteredCategories = await prisma.category.findMany({
      where: { superCategoryId: superCat.id, courses: { some: { locale: localeFilter } } },
      orderBy: { nameEn: "asc" },
      include: { _count: { select: { courses: true } } },
    });

    return (
      <div>
        <Breadcrumb />
        <section className="bg-navy pb-10 pt-28 text-white">
          <div className="mx-auto max-w-7xl px-4">
            <h1 className="text-3xl font-bold sm:text-4xl">{localeText({ en: superCat.nameEn, ar: superCat.nameAr }, l)}</h1>
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-4 py-10">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCategories.map((c) => (
              <Link key={c.id} href={`/training-courses/${c.slug}`} className="group overflow-hidden rounded-xl border bg-white p-5 transition-all hover:-translate-y-1 hover:border-brand hover:shadow-lg">
                {c.icon ? (
                  <img src={c.icon} alt="" className="h-10 w-10 rounded-lg object-contain" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-light text-brand text-sm font-bold">
                    {localeText({ en: c.nameEn, ar: c.nameAr }, l).charAt(0)}
                  </div>
                )}
                <h3 className="mt-3 font-semibold text-navy group-hover:text-brand">
                  {localeText({ en: c.nameEn, ar: c.nameAr }, l)}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {localeText({ en: c.taglineEn, ar: c.taglineAr }, l)}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {c._count.courses} {l === "ar" ? "دورة" : "courses"}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    );
  }

  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) notFound();

  const localeFilter = l === "ar" ? { in: ["ar", "both"] } : { in: ["en", "both"] };
  const schedules = await prisma.schedule.findMany({
    where: { course: { categoryId: category.id, locale: localeFilter } },
    include: { course: true, venue: true },
    orderBy: { startDate: "asc" },
  });

  return (
    <div>
      <Breadcrumb />
      <section className="bg-navy pb-10 pt-28 text-white">
        <div className="mx-auto max-w-7xl px-4">
          <h1 className="text-3xl font-bold sm:text-4xl">{localeText({ en: category.nameEn, ar: category.nameAr }, l)}</h1>
          <p className="mt-2 text-white/70">{localeText({ en: category.taglineEn, ar: category.taglineAr }, l)}</p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="space-y-4">
          {schedules.map((s) => (
            <Link
              key={s.id}
              href={`/training-course/${s.course.slug}`}
              className="group flex gap-4 rounded-xl border bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              {s.course.image && (
                <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-lg">
                  <img src={s.course.image} alt="" className="course-card-img h-full w-full object-cover" loading="lazy" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-navy group-hover:text-brand">
                  {localeText({ en: s.course.titleEn, ar: s.course.titleAr }, l)}
                </h3>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><CalendarDays size={13} className="text-brand" /> {formatDateRange(s.startDate, s.endDate, l)}</span>
                  <span className="flex items-center gap-1"><Globe2 size={13} className="text-brand" /> {s.venue.nameEn}</span>
                  <span className="font-semibold text-navy">{formatCurrency(Number(s.fee), s.currency)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
