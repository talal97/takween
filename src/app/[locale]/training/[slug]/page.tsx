import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { localeText } from "@/lib/data";
import { formatDateRange } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function VenuePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const l = (locale === "ar" ? "ar" : "en") as "en" | "ar";
  setRequestLocale(locale);

  const venue = await prisma.venue.findUnique({ where: { slug }, include: { region: true } });
  if (!venue) notFound();

  const localeFilter = l === "ar" ? { in: ["ar", "both"] } : { in: ["en", "both"] };
  const schedules = await prisma.schedule.findMany({
    where: { venueId: venue.id, startDate: { gte: new Date() }, course: { locale: localeFilter } },
    include: { course: true, venue: true },
    orderBy: { startDate: "asc" },
    take: 50,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold text-navy">{venue.nameEn}</h1>
      <p className="mt-1 text-muted-foreground">
        {venue.country} • {localeText({ en: venue.region?.nameEn, ar: venue.region?.nameAr }, l)}
      </p>
      <div className="mt-6 space-y-3">
        {schedules.length === 0 && (
          <Card><CardContent className="py-10 text-center text-muted-foreground">No upcoming courses at this venue.</CardContent></Card>
        )}
        {schedules.map((s) => (
          <Card key={s.id}>
            <CardContent className="pt-6">
              <Link href={`/training-course/${s.course.slug}`} className="group">
                <div className="font-semibold text-navy group-hover:text-brand">
                  {localeText({ en: s.course.titleEn, ar: s.course.titleAr }, l)}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                  <Badge variant="secondary">{formatDateRange(s.startDate, s.endDate, l)}</Badge>
                  <Badge variant="secondary">{s.course.code}</Badge>
                </div>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}