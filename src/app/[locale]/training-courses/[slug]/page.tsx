import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { localeText } from "@/lib/data";
import { formatDateRange, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Link } from "@/i18n/navigation";
import { CalendarDays, Globe2 } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const l = (locale === "ar" ? "ar" : "en") as "en" | "ar";
  const category = await prisma.category.findUnique({ where: { slug } });
  return {
    title: category ? localeText({ en: category.nameEn, ar: category.nameAr }, l) : "Training Courses",
    alternates: { canonical: `/${locale}/training-courses/${slug}` },
  };
}

export default async function CategoryCoursesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale, slug } = await params;
  const l = (locale === "ar" ? "ar" : "en") as "en" | "ar";
  setRequestLocale(locale);

  const sp = await searchParams;
  const format = (sp.format as string) || "";
  const venue = (sp.venue as string) || "";
  const year = (sp.year as string) || "";

  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) notFound();

  const localeFilter = l === "ar" ? { in: ["ar", "both"] } : { in: ["en", "both"] };

  const yearsAll = await prisma.schedule.findMany({
    where: { course: { categoryId: category.id, locale: localeFilter } },
    select: { startDate: true },
  });

  const where: Prisma.ScheduleWhereInput = {
    course: { categoryId: category.id, locale: localeFilter },
    ...(format ? { format } : {}),
    ...(venue ? { venueId: venue } : {}),
    ...(year ? { startDate: { gte: new Date(`${year}-01-01`), lt: new Date(`${Number(year) + 1}-01-01`) } } : {}),
  };

  const [schedules, courseCount] = await Promise.all([
    prisma.schedule.findMany({
      where,
      include: { course: true, venue: true },
      orderBy: { startDate: "asc" },
    }),
    prisma.course.count({ where: { categoryId: category.id, locale: localeFilter } }),
  ]);

  const years = [...new Set(yearsAll.map((y) => new Date(y.startDate).getFullYear()))].sort();

  return (
    <div>
      <section className="bg-navy pb-10 pt-28 text-white">
        <div className="mx-auto max-w-7xl px-4">
          <h1 className="text-3xl font-bold sm:text-4xl">
            {localeText({ en: category.nameEn, ar: category.nameAr }, l)}
          </h1>
          <p className="mt-2 text-white/70">
            {localeText({ en: category.taglineEn, ar: category.taglineAr }, l) ||
              `${courseCount} ${l === "ar" ? "دورة" : "courses"}`}
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border bg-white p-5">
            <h3 className="mb-4 font-semibold text-navy">{l === "ar" ? "الفلاتر" : "Filters"}</h3>
            <div className="space-y-5 text-sm">
              <div>
                <Label className="text-muted-foreground">{l === "ar" ? "السنة" : "Year"}</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  <YearChip label={l === "ar" ? "الكل" : "All"} href={`?`} active={!year} />
                  {years.map((y) => (
                    <YearChip key={y} label={String(y)} href={`?year=${y}`} active={year === String(y)} />
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">{l === "ar" ? "النوع" : "Format"}</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  <YearChip label={l === "ar" ? "الكل" : "All"} href={`?${year ? `year=${year}&` : ""}`} active={!format} />
                  <YearChip label={l === "ar" ? "قاعة" : "Classroom"} href={`?${year ? `year=${year}&` : ""}format=classroom`} active={format === "classroom"} />
                  <YearChip label={l === "ar" ? "أونلاين" : "Online"} href={`?${year ? `year=${year}&` : ""}format=online`} active={format === "online"} />
                </div>
              </div>
              <Badge variant="secondary" className="w-full justify-center">
                {schedules.length} {l === "ar" ? "نتيجة من" : "of"} {courseCount}
              </Badge>
            </div>
          </div>
        </aside>

        <div className="space-y-4">
          {schedules.length === 0 && (
            <div className="rounded-xl border bg-white py-10 text-center text-muted-foreground">
              {l === "ar" ? "لم يتم العثور على دورات" : "No courses found."}
            </div>
          )}
          {schedules.map((s) => (
            <Link
              key={s.id}
              href={`/training-course/${s.course.slug}`}
              className="group flex gap-4 rounded-xl border bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              {s.course.image && (
                <div className="relative h-28 w-36 shrink-0 overflow-hidden rounded-lg">
                  <img src={s.course.image} alt="" className="course-card-img h-full w-full object-cover" loading="lazy" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-navy group-hover:text-brand">
                  {localeText({ en: s.course.titleEn, ar: s.course.titleAr }, l)}
                </h3>
                <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
                  {localeText({ en: s.course.subtitleEn, ar: s.course.subtitleAr }, l)}
                </p>
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

function YearChip({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={
        active
          ? "rounded-full bg-brand px-3 py-1 text-xs font-medium text-white"
          : "rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground hover:border-brand hover:text-brand"
      }
    >
      {label}
    </Link>
  );
}
