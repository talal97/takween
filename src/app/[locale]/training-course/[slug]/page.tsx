import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { localeText } from "@/lib/data";
import { formatDateRange, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AccordionBlock } from "@/components/site/faq-accordion";
import { RegistrationForm } from "@/components/site/registration-form";
import { Link } from "@/i18n/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const l = (locale === "ar" ? "ar" : "en") as "en" | "ar";
  const course = await prisma.course.findUnique({ where: { slug } });
  const title = course ? localeText({ en: course.titleEn, ar: course.titleAr }, l) : "Course";
  return {
    title,
    description: course?.subtitleEn || undefined,
    alternates: { canonical: `/${locale}/training-course/${slug}` },
  };
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const l = (locale === "ar" ? "ar" : "en") as "en" | "ar";
  setRequestLocale(locale);
  const t = await getTranslations("course");
  const tc = await getTranslations("common");

  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      category: { include: { faqs: true } },
      schedules: { include: { venue: true }, orderBy: { startDate: "asc" } },
      certificates: true,
      relatedAsSource: { include: { related: { include: { schedules: { orderBy: { startDate: "asc" }, include: { venue: true } } } } } },
    },
  });
  if (!course) notFound();

  const [countries, providers] = await Promise.all([
    prisma.country.findMany({ orderBy: { nameEn: "asc" } }),
    prisma.providerAssociation.findMany({
      where: { OR: [{ courseId: course.id }, { courseId: null }] },
      orderBy: { sort: "asc" },
    }),
  ]);
  const faqs = course.category.faqs;

  const explicitRelated = course.relatedAsSource.map((r) => r.related);
  const related =
    explicitRelated.length > 0
      ? explicitRelated
      : await prisma.course.findMany({
          where: { categoryId: course.categoryId, id: { not: course.id } },
          include: { schedules: { orderBy: { startDate: "asc" }, include: { venue: true } } },
          take: 3,
        });

  const days = (course.dayOutlineEn as Array<{ day: number; title: string; topics: string[] }> | null) ?? [];

  const schedules = course.schedules.map((s) => ({
    id: s.id,
    venueId: s.venueId,
    venueName: s.venue.nameEn,
    startDate: formatDateRange(s.startDate, s.endDate, l),
    endDate: "",
    fee: Number(s.fee),
    currency: s.currency,
    format: s.format,
  }));

  return (
    <div>
      <section className="bg-navy text-white">
        <div className="mx-auto max-w-7xl px-4 py-10">
          {course.image && (
            <img
              src={course.image}
              alt={localeText({ en: course.titleEn, ar: course.titleAr }, l)}
              className="mb-6 h-44 w-full rounded-lg object-cover"
            />
          )}
          <Badge className="bg-brand">{course.badgeEn || `${course.durationDays}-Day Training`}</Badge>
          <h1 className="mt-3 text-3xl font-bold">
            {localeText({ en: course.titleEn, ar: course.titleAr }, l)}
          </h1>
          <p className="mt-2 text-white/80">
            {localeText({ en: course.subtitleEn, ar: course.subtitleAr }, l)}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <h2 className="mb-4 font-semibold text-navy">{t("scheduledDates")}</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 pr-4">{tc("date")}</th>
                    <th className="py-2 pr-4">{tc("venue")}</th>
                    <th className="py-2">{tc("fee")}</th>
                  </tr>
                </thead>
                <tbody>
                  {course.schedules.map((s) => (
                    <tr key={s.id} className="border-b last:border-0">
                      <td className="py-2 pr-4">{formatDateRange(s.startDate, s.endDate, l)}</td>
                      <td className="py-2 pr-4">{s.venue.nameEn}, {s.venue.country}</td>
                      <td className="py-2 font-medium">{formatCurrency(Number(s.fee), s.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-12 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {course.introEn && (
            <Prose title={t("introduction")} body={localeText({ en: course.introEn, ar: course.introAr }, l)} />
          )}
          {course.objectivesEn && (
            <Prose title={t("objectives")} body={localeText({ en: course.objectivesEn, ar: course.objectivesAr }, l)} />
          )}
          {course.methodologyEn && (
            <Prose title={t("methodology")} body={localeText({ en: course.methodologyEn, ar: course.methodologyAr }, l)} />
          )}
          {course.orgImpactEn && (
            <Prose title={t("orgImpact")} body={localeText({ en: course.orgImpactEn, ar: course.orgImpactAr }, l)} />
          )}
          {course.personalImpactEn && (
            <Prose title={t("personalImpact")} body={localeText({ en: course.personalImpactEn, ar: course.personalImpactAr }, l)} />
          )}
          {course.targetAudienceEn && (
            <Prose title={t("targetAudience")} body={localeText({ en: course.targetAudienceEn, ar: course.targetAudienceAr }, l)} />
          )}

          {days.length > 0 && (
            <div>
              <h2 className="mb-4 text-lg font-semibold text-navy">{t("outline")}</h2>
              <div className="space-y-3">
                {days.map((d) => (
                  <div key={d.day} className="rounded-md border p-4">
                    <div className="font-medium text-brand">{t("day")} {d.day}</div>
                    <div className="font-semibold">{d.title}</div>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                      {d.topics.map((tp) => (
                        <li key={tp}>{tp}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {faqs.length > 0 && (
            <div>
              <h2 className="mb-4 text-lg font-semibold text-navy">{tc("faq")}</h2>
              <AccordionBlock
                items={faqs.map((f) => ({
                  q: localeText({ en: f.questionEn, ar: f.questionAr }, l),
                  a: localeText({ en: f.answerEn, ar: f.answerAr }, l),
                }))}
              />
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="mb-4 font-semibold text-navy">{tc("registerNow")}</h3>
              <RegistrationForm
                courseTitle={localeText({ en: course.titleEn, ar: course.titleAr }, l)}
                courseCode={course.code}
                schedules={schedules}
                countries={countries.map((c) => ({ iso: c.iso, nameEn: c.nameEn, nameAr: c.nameAr ?? "" }))}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 pt-6">
              <h3 className="font-semibold text-navy">{t("options")}</h3>
              <div className="grid grid-cols-2 gap-3">
                <DownloadLink slug={course.slug} format="pdf" label={l === "ar" ? "تحميل PDF" : "Download PDF"} />
                <DownloadLink slug={course.slug} format="xlsx" label={l === "ar" ? "تحميل Excel" : "Download Excel"} />
              </div>
              <p className="text-xs text-muted-foreground">
                {l === "ar" ? "روابط متاحة لجدول الدورة والتفاصيل." : "Available course schedule and brochure."}
              </p>
            </CardContent>
          </Card>

          {course.certificates.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="mb-3 font-semibold text-navy">{t("certificates")}</h3>
                <ul className="space-y-2">
                  {course.certificates.map((c) => (
                    <li key={c.id}>
                      <Link href={`/certified-courses/${c.slug}`} className="text-sm font-medium text-brand hover:underline">
                        {localeText({ en: c.nameEn, ar: c.nameAr }, l)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {providers.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="mb-3 font-semibold text-navy">{t("providers")}</h3>
                <ul className="space-y-2">
                  {providers.map((p) => (
                    <li key={p.id} className="flex items-center gap-2 text-sm">
                      {p.logo ? (
                        <img src={p.logo} alt="" className="h-6 w-auto object-contain" />
                      ) : (
                        <Badge variant="outline" className="shrink-0 border-brand/30 text-brand">{p.code || p.nameEn}</Badge>
                      )}
                      {p.url ? (
                        <a href={p.url} target="_blank" rel="noreferrer" className="font-medium text-brand hover:underline">{p.nameEn}</a>
                      ) : (
                        <span className="font-medium text-navy">{p.nameEn}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </aside>
      </section>

      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-12">
          <h2 className="mb-4 text-xl font-bold text-navy">{t("relatedCourses")}</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((rc) => {
              const next = rc.schedules[0];
              return (
                <Card key={rc.id} className="group transition-all hover:-translate-y-0.5 hover:shadow-lg">
                  <CardContent className="flex h-full flex-col p-5">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="border-brand/30 text-brand">{rc.code}</Badge>
                      {next && <span className="text-xs text-muted-foreground">{next.venue.nameEn}</span>}
                    </div>
                    <Link href={`/training-course/${rc.slug}`} className="mt-3 flex-1">
                      <h3 className="font-semibold text-navy group-hover:text-brand">
                        {localeText({ en: rc.titleEn, ar: rc.titleAr }, l)}
                      </h3>
                      {next && (
                        <p className="mt-2 text-sm text-muted-foreground">
                          {formatDateRange(next.startDate, next.endDate, l)}
                        </p>
                      )}
                    </Link>
                    <Link href={`/training-course/${rc.slug}`} className="mt-3 text-sm font-semibold text-brand hover:underline">
                      {tc("registerNow")}
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

function Prose({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h2 className="mb-2 text-lg font-semibold text-navy">{title}</h2>
      <div className="whitespace-pre-line text-sm leading-6 text-muted-foreground">{body}</div>
    </div>
  );
}

function DownloadLink({ slug, format, label }: { slug: string; format: "pdf" | "xlsx"; label: string }) {
  return (
    <a
      href={`/api/export/course/${slug}?format=${format}`}
      className="rounded-lg border border-brand/30 bg-brand-light px-4 py-2.5 text-center text-sm font-semibold text-brand transition-colors hover:bg-brand hover:text-white"
    >
      {label}
    </a>
  );
}