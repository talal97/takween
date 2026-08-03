import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { localeText } from "@/lib/data";
import { formatDateRange, formatCurrency } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { CalendarDays, Globe2 } from "lucide-react";

export default async function TrainingCalendarPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l = (locale === "ar" ? "ar" : "en") as "en" | "ar";
  setRequestLocale(locale);

  const localeFilter = l === "ar" ? { in: ["ar", "both"] } : { in: ["en", "both"] };
  const schedules = await prisma.schedule.findMany({
    where: { startDate: { gte: new Date() }, course: { locale: localeFilter } },
    include: { course: true, venue: true },
    orderBy: { startDate: "asc" },
    take: 100,
  });

  const byMonth = new Map<string, typeof schedules>();
  for (const s of schedules) {
    const key = new Date(s.startDate).toLocaleDateString(l === "ar" ? "ar" : "en-GB", { month: "long", year: "numeric" });
    if (!byMonth.has(key)) byMonth.set(key, []);
    byMonth.get(key)!.push(s);
  }

  return (
    <div>
      <section className="bg-navy pb-10 pt-28 text-white">
        <div className="mx-auto max-w-7xl px-4">
          <h1 className="text-3xl font-bold sm:text-4xl">{l === "ar" ? "التقويم التدريبي" : "Training Calendar"}</h1>
          <p className="mt-2 text-white/70">{l === "ar" ? "جدول الدورات التدريبية القادمة" : "Upcoming training schedules across all venues"}</p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-2">
          {[...byMonth.entries()].map(([month, rows]) => (
            <section key={month}>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-navy">
                <CalendarDays className="h-5 w-5 text-brand" />
                {month}
              </h2>
              <div className="space-y-3">
                {rows.map((s) => (
                  <Link
                    key={s.id}
                    href={`/training-course/${s.course.slug}`}
                    className="group flex gap-3 rounded-xl border bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    {s.course.image && (
                      <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-lg">
                        <img src={s.course.image} alt="" className="course-card-img h-full w-full object-cover" loading="lazy" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="font-semibold text-navy group-hover:text-brand">
                        {localeText({ en: s.course.titleEn, ar: s.course.titleAr }, l)}
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CalendarDays size={12} className="text-brand" />
                          {formatDateRange(s.startDate, s.endDate, l)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Globe2 size={12} className="text-brand" />
                          {s.venue.nameEn}
                        </span>
                        <span className="font-semibold text-navy">{formatCurrency(Number(s.fee), s.currency)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>
    </div>
  );
}
