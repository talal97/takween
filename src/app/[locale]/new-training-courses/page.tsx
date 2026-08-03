import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { localeText } from "@/lib/data";
import { formatDateRange } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default async function NewTrainingCoursesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l = (locale === "ar" ? "ar" : "en") as "en" | "ar";
  setRequestLocale(locale);
  const localeFilter = l === "ar" ? { in: ["ar", "both"] } : { in: ["en", "both"] };
  const courses = await prisma.course.findMany({
    where: { locale: localeFilter },
    orderBy: { createdAt: "desc" },
    take: 24,
    include: { schedules: { orderBy: { startDate: "asc" }, include: { venue: true } } },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold text-navy">{l === "ar" ? "الدورات الجديدة" : "New Training Courses"}</h1>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((c) => {
          const next = c.schedules[0];
          return (
            <Link key={c.id} href={`/training-course/${c.slug}`} className="group rounded-lg border p-5 transition-shadow hover:shadow-md">
              <h3 className="font-semibold text-navy group-hover:text-brand">{localeText({ en: c.titleEn, ar: c.titleAr }, l)}</h3>
              {next && (
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="secondary">{formatDateRange(next.startDate, next.endDate, l)}</Badge>
                  <span>{next.venue.nameEn}</span>
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}