import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { localeText } from "@/lib/data";
import { formatDateRange } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";

export default async function TrainingCalendarPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l = (locale === "ar" ? "ar" : "en") as "en" | "ar";
  setRequestLocale(locale);

  const schedules = await prisma.schedule.findMany({
    where: { startDate: { gte: new Date() } },
    include: { course: true, venue: true },
    orderBy: { startDate: "asc" },
    take: 100,
  });

  const byMonth = new Map<string, typeof schedules>();
  for (const s of schedules) {
    const key = s.startDate.toLocaleDateString(l === "ar" ? "ar" : "en-GB", { month: "long", year: "numeric" });
    if (!byMonth.has(key)) byMonth.set(key, []);
    byMonth.get(key)!.push(s);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold text-navy">{l === "ar" ? "التقويم التدريبي" : "Training Calendar"}</h1>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {[...byMonth.entries()].map(([month, rows]) => (
          <section key={month}>
            <h2 className="mb-3 text-lg font-bold text-navy">{month}</h2>
            <div className="space-y-2">
              {rows.map((s) => (
                <Link key={s.id} href={`/training-course/${s.course.slug}`} className="block rounded-lg border p-3 transition-shadow hover:shadow-md">
                  <div className="font-semibold text-navy">{localeText({ en: s.course.titleEn, ar: s.course.titleAr }, l)}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="secondary">{formatDateRange(s.startDate, s.endDate, l)}</Badge>
                    <span>{s.venue.nameEn}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}