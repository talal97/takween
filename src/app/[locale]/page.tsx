import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { localeText } from "@/lib/data";
import { formatDateRange, formatCurrency } from "@/lib/utils";
import { QuickSearch } from "@/components/site/quick-search";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, Users, Award, Building2, MonitorPlay, Users as UsersIcon, Globe2, ShieldCheck, Quote } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "تكوين | للتدريب المهني" : "Takween | Professional Training Courses",
    alternates: { canonical: `/${locale}` },
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l = (locale === "ar" ? "ar" : "en") as "en" | "ar";
  setRequestLocale(locale);

  const t = await getTranslations("home");
  const tc = await getTranslations("common");

  const settings = await getSettings();
  const s = (k: string, fb: string) => settings[`${k}_${l}`] || fb;
  const sLocal = (k: string, fb: string) => settings[k] || fb;

  const [categories, regionsList, certificates, featured, articles, testimonials, clients, categoryCounts] =
    await Promise.all([
      prisma.category.findMany({ where: { featured: true }, orderBy: { sort: "asc" }, take: 12 }),
      prisma.region.findMany({ orderBy: { sort: "asc" }, include: { venues: { orderBy: { nameEn: "asc" } } } }),
      prisma.certificate.findMany({ orderBy: { sort: "asc" }, take: 8 }),
      prisma.course.findMany({
        where: { featured: true },
        orderBy: { updatedAt: "desc" },
        take: 6,
        include: { schedules: { orderBy: { startDate: "asc" }, include: { venue: true } }, category: true },
      }),
      prisma.article.findMany({ where: { status: "published" }, orderBy: { publishedAt: "desc" }, take: 3 }),
      prisma.testimonial.findMany({ where: { featured: true }, orderBy: { sort: "asc" }, take: 3 }),
      prisma.client.findMany({ orderBy: { sort: "asc" }, take: 12 }),
      prisma.course.groupBy({ by: ["categoryId"], _count: { _all: true } }),
    ]);

  const counts: Record<string, number> = {};
  categoryCounts.forEach((c) => {
    counts[c.categoryId] = c._count._all;
  });

  const allVenues = regionsList.flatMap((r) => r.venues);
  const totalCourses = await prisma.course.count();
  const totalVenues = allVenues.length;

  return (
    <div className="bg-background">
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden bg-navy text-white">
        <div className="absolute inset-0 opacity-[0.07]" aria-hidden="true" />
        <div className="mx-auto max-w-7xl px-4 py-16 lg:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-gold">
                <Award className="h-4 w-4" />
                {l === "ar" ? "تدريب عالمي معتمد" : "Globally accredited training"}
              </span>
              <h1 className="mt-5 text-4xl font-extrabold leading-tight sm:text-5xl">{s("hero_title", t("heroTitle"))}</h1>
              <p className="mt-4 max-w-xl text-lg text-white/80">{s("hero_subtitle", t("heroSubtitle"))}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/training-subjects"
                  className="rounded-lg bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
                >
                  {l === "ar" ? "تصفح الدورات" : "Browse Courses"}
                </Link>
                <Link
                  href="/contact-us"
                  className="rounded-lg border border-white/30 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  {t("requestCallback")}
                </Link>
              </div>
              <div className="mt-10 grid max-w-md grid-cols-3 gap-4">
                {[
                  { n: totalCourses, label: l === "ar" ? "دورة" : "Courses" },
                  { n: totalVenues, label: l === "ar" ? "مدينة" : "Venues" },
                  { n: categories.length, label: l === "ar" ? "تخصص" : "Subjects" },
                ].map((s) => (
                  <div key={s.label} className="border-white/15">
                    <div className="text-3xl font-extrabold text-gold">+{s.n}</div>
                    <div className="mt-1 text-sm text-white/70">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category quick-picker card */}
            <div className="rounded-2xl border border-white/15 bg-white p-6 text-navy shadow-2xl">
              <QuickSearch
                categories={categories.map((c) => ({ key: c.id, slug: c.slug, labelEn: c.nameEn, labelAr: c.nameAr }))}
                venues={allVenues.map((v) => ({ key: v.id, slug: v.slug, labelEn: v.nameEn }))}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ============ CATEGORIES ============ */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-brand">{l === "ar" ? "تخصصاتنا" : "Our subjects"}</span>
            <h2 className="mt-2 text-2xl font-bold text-navy sm:text-3xl">{s("section_categories", t("categoriesTitle"))}</h2>
          </div>
          <Link href="/training-subjects" className="hidden text-sm font-semibold text-brand hover:underline sm:inline">
            {l === "ar" ? "عرض الكل ←" : "View all →"}
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((c) => {
            const count = counts[c.id] ?? 0;
            return (
              <Link
                key={c.id}
                href={`/training-courses/${c.slug}`}
                className="group relative overflow-hidden rounded-xl border bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-brand hover:shadow-lg"
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-brand opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-light text-brand">
                  <UsersIcon size={20} />
                </div>
                <h3 className="mt-4 font-semibold leading-snug text-navy group-hover:text-brand">
                  {localeText({ en: c.nameEn, ar: c.nameAr }, l)}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {l === "ar" ? `${count} دورة` : `${count} courses`}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ============ VENUES ============ */}
      <section className="bg-muted/50 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-sm font-semibold uppercase tracking-wider text-brand">{l === "ar" ? "أماكن التدريب" : "Training locations"}</span>
              <h2 className="mt-2 text-2xl font-bold text-navy sm:text-3xl">{s("section_venues", t("venuesTitle"))}</h2>
            </div>
            <Link href="/training" className="hidden text-sm font-semibold text-brand hover:underline sm:inline">
              {l === "ar" ? "المواقع ←" : "All venues →"}
            </Link>
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {regionsList.map((region) => (
              <div key={region.id} className="rounded-xl border bg-white p-6">
                <div className="mb-4 flex items-center gap-2 font-semibold text-navy">
                  <Globe2 className="h-5 w-5 text-brand" />
                  {localeText({ en: region.nameEn, ar: region.nameAr }, l)}
                </div>
                <div className="flex flex-wrap gap-2">
                  {region.venues.map((v) => (
                    <Link
                      key={v.id}
                      href={`/training/${v.slug}`}
                      className="rounded-full border px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:border-brand hover:bg-brand-light hover:text-navy"
                    >
                      {v.nameEn}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FORMATS ============ */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-brand">{l === "ar" ? "طرق التدريب" : "Training formats"}</span>
          <h2 className="mt-2 text-2xl font-bold text-navy sm:text-3xl">{s("section_formats", t("formatsTitle"))}</h2>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            { icon: Building2, title: l === "ar" ? "قاعات تدريب" : "Classroom", desc: l === "ar" ? "تعلم وجهاً لوجه في مدننا العالمية." : "Learn in-person at our venues worldwide." },
            { icon: MonitorPlay, title: l === "ar" ? "تدريب أونلاين" : "Online", desc: l === "ar" ? "جلسات مباشرة مع خبرائنا." : "Live virtual sessions with our expert trainers." },
            { icon: UsersIcon, title: l === "ar" ? "تدريب داخلي" : "In-House", desc: l === "ar" ? "برامج مخصصة لفريقك في موقعك." : "Tailored programmes for your team, on-site." },
          ].map((f) => (
            <div key={f.title} className="rounded-xl border bg-white p-6 text-center transition-shadow hover:shadow-md">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-light text-brand">
                <f.icon size={26} />
              </div>
              <h3 className="mt-4 font-semibold text-navy">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ FEATURED COURSES ============ */}
      <section className="bg-navy py-16 text-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-sm font-semibold uppercase tracking-wider text-gold">{l === "ar" ? "دورات مميزة" : "Popular right now"}</span>
              <h2 className="mt-2 text-2xl font-bold sm:text-3xl">{s("section_featured", t("featuredTitle"))}</h2>
            </div>
            <Link href="/new-training-courses" className="hidden text-sm font-semibold text-gold hover:underline sm:inline">
              {l === "ar" ? "عرض الكل ←" : "View all →"}
            </Link>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((c) => {
              const next = c.schedules[0];
              return (
                <Card key={c.id} className="group bg-white text-navy transition-all hover:-translate-y-0.5 hover:shadow-xl">
                  <CardContent className="flex h-full flex-col p-5">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="border-brand/30 text-brand">{c.code}</Badge>
                      {next && <span className="text-xs font-medium text-muted-foreground">{next.venue.nameEn}</span>}
                    </div>
                    <Link href={`/training-course/${c.slug}`} className="mt-4 flex-1">
                      <h3 className="font-semibold leading-snug text-navy transition-colors group-hover:text-brand">
                        {localeText({ en: c.titleEn, ar: c.titleAr }, l)}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {localeText({ en: c.subtitleEn, ar: c.subtitleAr }, l)}
                      </p>
                    </Link>
                    {next && (
                      <div className="mt-5 space-y-2 border-t pt-4 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <CalendarDays size={16} className="text-brand" />
                          {formatDateRange(next.startDate, next.endDate, l)}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Globe2 size={16} className="text-brand" />
                            {next.venue.nameEn}
                          </div>
                          <span className="font-semibold text-navy">{formatCurrency(Number(next.fee), next.currency)}</span>
                        </div>
                      </div>
                    )}
                    <Link href={`/training-course/${c.slug}`} className="mt-4 inline-flex items-center justify-center rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark">
                      {tc("registerNow")}
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ ABOUT + TESTIMONIALS ============ */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-brand">{l === "ar" ? "من نحن" : "Why Takween"}</span>
            <h2 className="mt-2 text-2xl font-bold text-navy sm:text-3xl">{s("section_about", t("aboutTitle"))}</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {s(
                "about_text",
                l === "ar"
                  ? "نحن شركة عالمية رائدة في التدريب المهني، نقدّم أكثر من 1000 دورة في مدن حول العالم، معتمدين على مدربين خبراء ومناهج عملية تدريب."
                  : "We are a leading professional training provider, delivering over 1000 courses across cities worldwide, powered by expert trainers and hands-on, practical curricula."
              )}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {[
                { icon: ShieldCheck, label: l === "ar" ? "معتمدون عالمياً" : "Globally accredited" },
                { icon: Users, label: l === "ar" ? "مدربون خبراء" : "Expert trainers" },
                { icon: Award, label: l === "ar" ? "برامج عملية" : "Practical programmes" },
              ].map((f) => (
                <span key={f.label} className="inline-flex items-center gap-2 rounded-full bg-brand-light px-4 py-2 text-sm font-medium text-navy">
                  <f.icon size={16} className="text-brand" />
                  {f.label}
                </span>
              ))}
            </div>
            <Link href="/about-us" className="mt-6 inline-block text-sm font-semibold text-brand hover:underline">
              {l === "ar" ? "اقرأ المزيد ←" : "Read more →"}
            </Link>
          </div>

          {testimonials.length > 0 && (
            <div className="space-y-4">
              {testimonials.map((tm) => (
                <figure key={tm.id} className="rounded-xl border bg-white p-6">
                  <Quote className="h-6 w-6 text-brand" />
                  <blockquote className="mt-3 text-navy">{localeText({ en: tm.textEn, ar: tm.textAr }, l)}</blockquote>
                  <figcaption className="mt-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy text-sm font-bold text-white">
                      {tm.author.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-navy">{tm.author}</div>
                      {tm.company && <div className="text-xs text-muted-foreground">{tm.company}</div>}
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============ CERTIFICATES ============ */}
      <section className="bg-navy py-16 text-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-sm font-semibold uppercase tracking-wider text-gold">{l === "ar" ? "الشهادات" : "Certificates"}</span>
              <h2 className="mt-2 text-2xl font-bold sm:text-3xl">{s("section_certificates", t("certificatesTitle"))}</h2>
            </div>
            <Link href="/certificates" className="hidden text-sm font-semibold text-gold hover:underline sm:inline">
              {l === "ar" ? "كل الشهادات ←" : "All certificates →"}
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {certificates.map((c) => (
              <Link
                key={c.id}
                href={`/certified-courses/${c.slug}`}
                className="rounded-xl border border-white/15 bg-white/5 p-5 text-sm font-medium text-white/90 transition-colors hover:border-gold hover:bg-white/10 hover:text-gold"
              >
                {localeText({ en: c.nameEn, ar: c.nameAr }, l)}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CLIENTS ============ */}
      {clients.length > 0 && (
        <section className="border-b bg-white py-12">
          <div className="mx-auto max-w-7xl px-4 text-center">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{s("section_clients", t("clientsTitle"))}</h3>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
              {clients.map((c) => (
                <span key={c.id} className="text-xl font-bold uppercase tracking-wide text-gray-300">
                  {c.nameEn}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ ARTICLES / INSIGHTS ============ */}
      {articles.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-sm font-semibold uppercase tracking-wider text-brand">{l === "ar" ? "المدونة" : "Blog"}</span>
              <h2 className="mt-2 text-2xl font-bold text-navy sm:text-3xl">{s("section_articles", t("articlesTitle"))}</h2>
            </div>
            <Link href="/resources" className="hidden text-sm font-semibold text-brand hover:underline sm:inline">
              {l === "ar" ? "كل المقالات ←" : "All articles →"}
            </Link>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {articles.map((a) => (
              <Link key={a.id} href={`/resources/${a.slug}`} className="group rounded-xl border bg-white p-6 transition-all hover:-translate-y-0.5 hover:shadow-lg">
                <h3 className="font-semibold leading-snug text-navy group-hover:text-brand">
                  {localeText({ en: a.titleEn, ar: a.titleAr }, l)}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {localeText({ en: a.excerptEn, ar: a.excerptAr }, l)}
                </p>
                <span className="mt-4 inline-block text-sm font-semibold text-brand">
                  {l === "ar" ? "اقرأ المزيد ←" : "Read more →"}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ============ CTA ============ */}
      <section className="bg-brand">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-10 text-center text-white sm:flex-row sm:text-left">
          <div>
            <h2 className="text-2xl font-bold">{s("cta_title", l === "ar" ? "جاهز لتطوير مهاراتك؟" : "Ready to advance your career?")}</h2>
            <p className="mt-1 text-white/90">{s("cta_subtitle", l === "ar" ? "تواصل مع مستشارينا التدريبيين اليوم." : "Talk to our training advisors today.")}</p>
          </div>
          <Link href="/contact-us" className="shrink-0 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-brand hover:bg-brand-light">
            {l === "ar" ? "اتصل بنا" : "Contact us"}
          </Link>
        </div>
      </section>
    </div>
  );
}