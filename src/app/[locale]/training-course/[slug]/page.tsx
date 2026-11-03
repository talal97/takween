
import { serializeJsonLd } from "@/lib/safe-json";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { localeText } from "@/lib/data";
import { formatDateRange, formatCurrency } from "@/lib/utils";
import { siteUrl, absoluteImage, courseJsonLd } from "@/lib/seo";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AccordionBlock } from "@/components/site/faq-accordion";
import { RegistrationForm } from "@/components/site/registration-form";
import { Link } from "@/i18n/navigation";
import { Locale } from "@/i18n/config";
import { Breadcrumb } from "@/components/site/breadcrumb";
import { ShareButtons } from "@/components/site/share-buttons";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const l = (locale === "ar" ? "ar" : "en") as Locale;
  const localeFilter = l === "ar" ? { in: ["ar", "both"] } : { in: ["en", "both"] };
  const course = await prisma.course.findFirst({ where: { slug, locale: localeFilter }, orderBy: { locale: l === "ar" ? "asc" : "desc" } });
  const title = course ? localeText({ en: course.seoTitleEn, ar: course.seoTitleAr }, l) || localeText({ en: course.titleEn, ar: course.titleAr }, l) : "Course";
  const description = localeText({ en: course?.subtitleEn, ar: course?.subtitleAr }, l);
  const alternates: { canonical?: string; languages?: Record<string, string> } = {
    canonical: `/${locale}/training-course/${slug}`,
    languages: Object.fromEntries((course?.locale === "both" ? ["en", "ar"] : [l]).map((language) => [language, `/${language}/training-course/${slug}`])),
  };
  return {
    title,
    description,
    alternates,
    openGraph: {
      title,
      description,
      url: siteUrl(`/${locale}/training-course/${slug}`),
      images: course?.image ? [{ url: absoluteImage(course.image)! }] : undefined,
    },
  };
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const l = (locale === "ar" ? "ar" : "en") as Locale;
  setRequestLocale(locale);
  const t = await getTranslations("course");
  const tc = await getTranslations("common");

  const localeFilter = l === "ar" ? { in: ["ar", "both"] } : { in: ["en", "both"] };
  const course = await prisma.course.findFirst({
    where: { slug, locale: localeFilter },
    orderBy: { locale: l === "ar" ? "asc" : "desc" },
    include: {
      category: { include: { faqs: true } },
      schedules: { where: { endDate: { gte: new Date() } }, include: { venue: true }, orderBy: { startDate: "asc" } },
      certificates: true,
      relatedAsSource: { include: { related: { include: { schedules: { where: { endDate: { gte: new Date() } }, orderBy: { startDate: "asc" }, include: { venue: true } } } } } },
    },
  });

  if (!course) {
    // The slug exists but not for this locale — offer the localized version.
    const anyLocale = await prisma.course.findFirst({ where: { slug }, select: { locale: true } });
    if (anyLocale) {
      const targetLocale = l === "ar" ? "en" : "ar";
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
          <h1 className="text-3xl font-bold text-navy">
            {l === "ar" ? "هذه الدورة متوفرة باللغة الإنجليزية" : "This course is available in Arabic"}
          </h1>
          <p className="mt-3 max-w-md text-muted-foreground">
            {l === "ar"
              ? "تم نشر هذه الدورة في النسخة الإنجليزية من الموقع."
              : "This course was published on the Arabic version of the site."}
          </p>
          <Link
            href={`/training-course/${slug}`}
            locale={targetLocale}
            className="mt-6 rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            {l === "ar" ? "عرض النسخة الإنجليزية" : "View the Arabic version"}
          </Link>
        </div>
      );
    }
    notFound();
  }

  const [countries, providers] = await Promise.all([
    prisma.country.findMany({ orderBy: { nameEn: "asc" } }),
    prisma.providerAssociation.findMany({
      where: { OR: [{ courseId: course.id }, { courseId: null }] },
      orderBy: { sort: "asc" },
    }),
  ]);
  const faqs = course.category.faqs;

  const settingsRaw = await prisma.siteSetting.findUnique({ where: { key: "payment_methods" } });
  let paymentMethods: Array<{ id: string; label_en: string; label_ar: string; enabled: boolean }> = [];
  if (settingsRaw?.value) {
    try {
      const parsed = JSON.parse(settingsRaw.value);
      if (Array.isArray(parsed)) paymentMethods = parsed.filter((m: { enabled?: boolean }) => m.enabled !== false);
    } catch {}
  }
  if (paymentMethods.length === 0) {
    paymentMethods = [
      { id: "invoice-me", label_en: "Invoice Me", label_ar: "فاتورة شخصية", enabled: true },
      { id: "invoice-company", label_en: "Invoice Company", label_ar: "فاتورة الشركة", enabled: true },
    ];
  }

  const explicitRelated = course.relatedAsSource.map((r) => r.related).filter((r) => r.locale === l || r.locale === "both");
  const related =
    explicitRelated.length > 0
      ? explicitRelated
      : await prisma.course.findMany({
          where: { categoryId: course.categoryId, id: { not: course.id }, locale: localeFilter },
          include: { schedules: { where: { endDate: { gte: new Date() } }, orderBy: { startDate: "asc" }, include: { venue: true } } },
          take: 3,
        });

  const rawOutline = l === "ar" && Array.isArray(course.dayOutlineAr) && course.dayOutlineAr.length > 0 ? course.dayOutlineAr : course.dayOutlineEn;
  const days = (rawOutline as Array<{ day: number; title: string; topics: string[] }> | null) ?? [];

  const schedules = course.schedules.map((s) => ({
    id: s.id,
    venueId: s.venueId,
    venueName: localeText({ en: s.venue.nameEn, ar: s.venue.nameAr }, l),
    startDate: formatDateRange(s.startDate, s.endDate, l),
    endDate: "",
    fee: Number(s.fee),
    currency: s.currency,
    format: s.format,
  }));

  return (
    <div>
      <Breadcrumb />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(
            await courseJsonLd({
              name: localeText({ en: course.titleEn, ar: course.titleAr }, l),
              description: course.subtitleEn || undefined,
            }),
          ),
        }}
      />
      <section className="bg-navy pt-28 text-white">
        <div className="mx-auto max-w-7xl px-4 pb-10">
          {course.image && (
            <div className="relative mb-6 h-56 w-full overflow-hidden rounded-xl lg:h-72">
              <Image
                src={course.image}
                alt={localeText({ en: course.titleEn, ar: course.titleAr }, l)}
                fill
                sizes="(max-width: 1280px) 100vw, 1280px"
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
          )}
          <Badge className="bg-brand">{localeText({ en: course.badgeEn, ar: course.badgeAr }, l) || (l === "ar" ? `دورة تدريبية لمدة ${course.durationDays} أيام` : `${course.durationDays}-Day Training`)}</Badge>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            {localeText({ en: course.titleEn, ar: course.titleAr }, l)}
          </h1>
          <p className="mt-2 max-w-3xl text-white/80">
            {localeText({ en: course.subtitleEn, ar: course.subtitleAr }, l)}
          </p>
          <div className="mt-4">
            <ShareButtons
              title={localeText({ en: course.titleEn, ar: course.titleAr }, l)}
              description={localeText({ en: course.subtitleEn, ar: course.subtitleAr }, l)}
              path={`/${locale}/training-course/${slug}`}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <h2 className="mb-4 font-semibold text-navy">{t("scheduledDates")}</h2>
            {course.schedules.length === 0 ? (
              <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                {l === "ar" ? "لا توجد مواعيد قادمة — يرجى التواصل معنا للاستفسار." : "No upcoming dates — please contact us to enquire."}
              </p>
            ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-start text-muted-foreground">
                    <th className="py-2 pe-4">{tc("date")}</th>
                    <th className="py-2 pe-4">{tc("venue")}</th>
                    <th className="py-2 pe-4">{tc("fee")}</th>
                    <th className="py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {course.schedules.map((s) => (
                    <tr key={s.id} className="border-b last:border-0">
                      <td className="py-2 pe-4">{formatDateRange(s.startDate, s.endDate, l)}</td>
                      <td className="py-2 pe-4">{localeText({ en: s.venue.nameEn, ar: s.venue.nameAr }, l)}, {s.venue.country}</td>
                      <td className="py-2 pe-4 font-medium">{formatCurrency(Number(s.fee), s.currency)}</td>
                      <td className="py-2">
                        <a
                          href={`/api/calendar/${s.id}`}
                          className="text-xs font-medium text-brand underline hover:text-brand-dark"
                          data-track="calendar-download"
                        >
                          {l === "ar" ? "أضف للتقويم" : "Add to Calendar"}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-12 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {localeText({ en: course.introEn, ar: course.introAr }, l) && (
            <Prose title={t("introduction")} body={localeText({ en: course.introEn, ar: course.introAr }, l)} />
          )}
          {localeText({ en: course.objectivesEn, ar: course.objectivesAr }, l) && (
            <Prose title={t("objectives")} body={localeText({ en: course.objectivesEn, ar: course.objectivesAr }, l)} />
          )}
          {localeText({ en: course.methodologyEn, ar: course.methodologyAr }, l) && (
            <Prose title={t("methodology")} body={localeText({ en: course.methodologyEn, ar: course.methodologyAr }, l)} />
          )}
          {localeText({ en: course.orgImpactEn, ar: course.orgImpactAr }, l) && (
            <Prose title={t("orgImpact")} body={localeText({ en: course.orgImpactEn, ar: course.orgImpactAr }, l)} />
          )}
          {localeText({ en: course.personalImpactEn, ar: course.personalImpactAr }, l) && (
            <Prose title={t("personalImpact")} body={localeText({ en: course.personalImpactEn, ar: course.personalImpactAr }, l)} />
          )}
          {localeText({ en: course.targetAudienceEn, ar: course.targetAudienceAr }, l) && (
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
                    <ul className="mt-2 list-disc space-y-1 ps-5 text-sm text-muted-foreground">
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

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardContent className="pt-6">
              <h3 className="mb-4 font-semibold text-navy">{tc("registerNow")}</h3>
              <RegistrationForm
                courseTitle={localeText({ en: course.titleEn, ar: course.titleAr }, l)}
                courseCode={course.code}
                schedules={schedules}
                countries={countries.map((c) => ({ iso: c.iso, nameEn: c.nameEn, nameAr: c.nameAr ?? "" }))}
                paymentMethods={paymentMethods.map((m) => ({ id: m.id, label_en: m.label_en, label_ar: m.label_ar }))}
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

          {(course.certificates.length > 0 || localeText({ en: course.certificateNoteEn, ar: course.certificateNoteAr }, l)) && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="mb-3 font-semibold text-navy">{t("certificates")}</h3>
                <p className="mb-3 whitespace-pre-line text-sm">{localeText({ en: course.certificateNoteEn, ar: course.certificateNoteAr }, l)}</p>
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
        <section className="section-divider mx-auto max-w-7xl px-4 py-12">
          <h2 className="mb-6 text-xl font-bold text-navy">{t("relatedCourses")}</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((rc) => {
              const next = rc.schedules[0];
              return (
                <Link key={rc.id} href={`/training-course/${rc.slug}`} className="group overflow-hidden rounded-xl border bg-white transition-all hover:-translate-y-1 hover:shadow-lg">
                  {rc.image && (
                    <div className="relative h-40 overflow-hidden">
                      <img src={rc.image} alt="" className="course-card-img h-full w-full object-cover" loading="lazy" />
                    </div>
                  )}
                  <div className="p-5">
                    <Badge variant="outline" className="mb-2 border-brand/30 text-brand">{rc.code}</Badge>
                    <h3 className="font-semibold text-navy group-hover:text-brand">
                      {localeText({ en: rc.titleEn, ar: rc.titleAr }, l)}
                    </h3>
                    {next && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {formatDateRange(next.startDate, next.endDate, l)}
                      </p>
                    )}
                  </div>
                </Link>
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
      data-track={`download-${format}`}
      className="rounded-lg border border-brand/30 bg-brand-light px-4 py-2.5 text-center text-sm font-semibold text-brand transition-colors hover:bg-brand hover:text-white"
    >
      {label}
    </a>
  );
}
