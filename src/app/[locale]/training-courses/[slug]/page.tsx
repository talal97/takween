import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { localeText } from "@/lib/data";
import { formatDateRange, formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Link } from "@/i18n/navigation";

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

  const yearsAll = await prisma.schedule.findMany({
    where: { course: { categoryId: category.id } },
    select: { startDate: true },
  });

  const where: Prisma.ScheduleWhereInput = {
    course: { categoryId: category.id },
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
    prisma.course.count({ where: { categoryId: category.id } }),
  ]);

  const years = [...new Set(yearsAll.map((y) => new Date(y.startDate).getFullYear()))].sort();

  return (
    <div>
      <section className="bg-muted/50">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <h1 className="text-3xl font-bold text-navy">
            {localeText({ en: category.nameEn, ar: category.nameAr }, l)}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {localeText({ en: category.taglineEn, ar: category.taglineAr }, l) ||
              `${courseCount} ${l === "ar" ? "دورة" : "courses"}`}
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <h3 className="mb-3 font-semibold">Filters</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <Label>Year</Label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <YearChip label="All" href={`?`} active={!year} />
                    {years.map((y) => (
                      <YearChip key={y} label={String(y)} href={`?year=${y}`} active={year === String(y)} />
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Format</Label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <YearChip label="All" href={`?${year ? `year=${year}&` : ""}`} active={!format} />
                    <YearChip label="Classroom" href={`?${year ? `year=${year}&` : ""}format=classroom`} active={format === "classroom"} />
                    <YearChip label="Online" href={`?${year ? `year=${year}&` : ""}format=online`} active={format === "online"} />
                  </div>
                </div>
                <div>
                  <Badge variant="secondary">
                    Showing {schedules.length} of {courseCount}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>

        <div className="space-y-3">
          {schedules.length === 0 && (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">No courses found.</CardContent>
            </Card>
          )}
          {schedules.map((s) => (
            <Card key={s.id}>
              <CardContent className="pt-6">
                <Link href={`/training-course/${s.course.slug}`} className="group">
                  <div className="font-semibold text-navy group-hover:text-brand">
                    {localeText({ en: s.course.titleEn, ar: s.course.titleAr }, l)}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {localeText({ en: s.course.subtitleEn, ar: s.course.subtitleAr }, l)}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                    <Badge variant="secondary">{formatDateRange(s.startDate, s.endDate, l)}</Badge>
                    <Badge variant="secondary">{s.venue.nameEn}</Badge>
                    <span className="font-medium">{formatCurrency(Number(s.fee), s.currency)}</span>
                  </div>
                </Link>
              </CardContent>
            </Card>
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