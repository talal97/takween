import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { localeText } from "@/lib/data";
import { formatDateRange } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
    });

    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="text-3xl font-bold text-navy">{localeText({ en: superCat.nameEn, ar: superCat.nameAr }, l)}</h1>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCategories.map((c) => (
            <Link key={c.id} href={`/training-courses/${c.slug}`} className="group rounded-lg border p-4 transition-shadow hover:shadow-md">
              <div className="font-semibold text-navy group-hover:text-brand">{localeText({ en: c.nameEn, ar: c.nameAr }, l)}</div>
              <div className="mt-1 text-sm text-muted-foreground">{localeText({ en: c.taglineEn, ar: c.taglineAr }, l)}</div>
            </Link>
          ))}
        </div>
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
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold text-navy">{localeText({ en: category.nameEn, ar: category.nameAr }, l)}</h1>
      <p className="mt-2 text-muted-foreground">{localeText({ en: category.taglineEn, ar: category.taglineAr }, l)}</p>
      <div className="mt-6 space-y-3">
        {schedules.map((s) => (
          <Card key={s.id}>
            <CardContent className="pt-6">
              <Link href={`/training-course/${s.course.slug}`} className="group">
                <div className="font-semibold text-navy group-hover:text-brand">
                  {localeText({ en: s.course.titleEn, ar: s.course.titleAr }, l)}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                  <Badge variant="secondary">{formatDateRange(s.startDate, s.endDate, l)}</Badge>
                  <Badge variant="secondary">{s.venue.nameEn}</Badge>
                </div>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}