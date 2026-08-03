import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { localeText } from "@/lib/data";
import { formatDateRange, formatCurrency } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { CalendarDays, Globe2 } from "lucide-react";

export default async function CertifiedCoursePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const l = (locale === "ar" ? "ar" : "en") as "en" | "ar";
  setRequestLocale(locale);

  const cert = await prisma.certificate.findUnique({ where: { slug }, include: { courses: true } });
  if (!cert) notFound();

  const localeFilter = l === "ar" ? { in: ["ar", "both"] } : { in: ["en", "both"] };
  const courseIds = cert.courses.filter((c) => c.locale === localeFilter.in[0] || c.locale === localeFilter.in[1]).map((c) => c.id);
  const schedules = courseIds.length
    ? await prisma.schedule.findMany({
        where: { courseId: { in: courseIds } },
        include: { course: true, venue: true },
        orderBy: { startDate: "asc" },
      })
    : [];

  return (
    <div>
      <section className="bg-navy pb-10 pt-28 text-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-center gap-4">
            {cert.logo && (
              <img src={cert.logo} alt="" className="h-14 w-14 rounded-xl object-contain" />
            )}
            <div>
              <h1 className="text-3xl font-bold sm:text-4xl">{localeText({ en: cert.nameEn, ar: cert.nameAr }, l)}</h1>
              {cert.description && (
                <p className="mt-2 max-w-2xl text-white/70">{cert.description}</p>
              )}
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-10">
        {schedules.length === 0 && (
          <div className="rounded-xl border bg-white py-10 text-center text-muted-foreground">
            {l === "ar" ? "لا توجد دورات مرتبطة بهذه الشهادة بعد." : "No courses linked to this certificate yet."}
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
