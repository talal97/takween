import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { localeText } from "@/lib/data";
import { formatDateRange, formatCurrency } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { CalendarDays } from "lucide-react";

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
    <div>
      <section className="bg-navy pb-10 pt-28 text-white">
        <div className="mx-auto max-w-7xl px-4">
          <h1 className="text-3xl font-bold sm:text-4xl">{venue.nameEn}</h1>
          <p className="mt-2 text-white/70">
            {venue.country} • {localeText({ en: venue.region?.nameEn, ar: venue.region?.nameAr }, l)}
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-10">
        {schedules.length === 0 && (
          <div className="rounded-xl border bg-white py-10 text-center text-muted-foreground">
            {l === "ar" ? "لا توجد دورات قادمة في هذا الموقع" : "No upcoming courses at this venue."}
          </div>
        )}
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
                  <Badge variant="outline" className="border-brand/30 text-brand">{s.course.code}</Badge>
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
