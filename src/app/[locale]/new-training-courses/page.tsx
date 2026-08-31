import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { localeText } from "@/lib/data";
import { formatDateRange, formatCurrency } from "@/lib/utils";
import { CalendarDays, Globe2 } from "lucide-react";
import { Breadcrumb } from "@/components/site/breadcrumb";
import { buildPageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const title = locale === "ar" ? "الدورات الجديدة" : "New Training Courses";
  const description = locale === "ar" ? "اكتشف أحدث الدورات التدريبية المتاحة" : "Discover our latest training courses available worldwide";
  return buildPageMetadata({ title, description, locale, path: "/new-training-courses" });
}

export default async function NewTrainingCoursesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l = (locale === "ar" ? "ar" : "en") as "en" | "ar";
  setRequestLocale(locale);
  const localeFilter = l === "ar" ? { in: ["ar", "both"] } : { in: ["en", "both"] };
  const courses = await prisma.course.findMany({
    where: { locale: localeFilter },
    orderBy: { createdAt: "desc" },
    take: 24,
    include: { schedules: { where: { endDate: { gte: new Date() } }, orderBy: { startDate: "asc" }, include: { venue: true } } },
  });

  return (
    <div>
      <Breadcrumb />
      <section className="bg-navy pb-16 pt-28 text-white">
        <div className="mx-auto max-w-7xl px-4">
          <h1 className="text-3xl font-bold sm:text-4xl">{l === "ar" ? "الدورات الجديدة" : "New Training Courses"}</h1>
          <p className="mt-2 text-white/70">{l === "ar" ? "اكتشف أحدث الدورات التدريبية المتاحة" : "Discover our latest training courses available worldwide"}</p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => {
            const next = c.schedules[0];
            return (
              <Link key={c.id} href={`/training-course/${c.slug}`} className="group overflow-hidden rounded-xl border bg-white transition-all hover:-translate-y-1 hover:shadow-lg">
                {c.image && (
                  <div className="relative h-48 overflow-hidden">
                    <img src={c.image} alt="" className="course-card-img h-full w-full object-cover" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  </div>
                )}
                <div className="p-5">
                  <h3 className="font-semibold leading-snug text-navy group-hover:text-brand">
                    {localeText({ en: c.titleEn, ar: c.titleAr }, l)}
                  </h3>
                  {next && (
                    <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <CalendarDays size={14} className="shrink-0 text-brand" />
                        {formatDateRange(next.startDate, next.endDate, l)}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Globe2 size={14} className="shrink-0 text-brand" />
                          {next.venue.nameEn}
                        </div>
                        <span className="font-semibold text-navy">{formatCurrency(Number(next.fee), next.currency)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
