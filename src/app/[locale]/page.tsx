import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { getSettingsCached } from "@/lib/settings";
import { localeText, getHomePageDataCached, getCountriesCached } from "@/lib/data";
import { formatDateRange, formatCurrency } from "@/lib/utils";
import { QuickSearch } from "@/components/site/quick-search";
import { CountriesGrid } from "@/components/site/countries-grid";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Users, Award, Building2, MonitorPlay, Users as UsersIcon, Globe2, ShieldCheck, Quote, ArrowRight, CheckCircle2 } from "lucide-react";

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

  const settings = await getSettingsCached();
  const s = (k: string, fb: string) => settings[`${k}_${l}`] || fb;
  const heroImage = settings.hero_image || "";

  const {
    categories,
    regionsList,
    certificates,
    featured,
    articles,
    testimonials,
    clients,
    categoryCounts,
    totalCourses,
  } = await getHomePageDataCached(l);

  const countries = await getCountriesCached();

  const counts: Record<string, number> = {};
  categoryCounts.forEach((c) => {
    counts[c.categoryId] = c._count._all;
  });

  const allVenues = regionsList.flatMap((r) => r.venues);
  const totalVenues = allVenues.length;

  const heroBadge = s("hero_badge", l === "ar" ? "تدريب عالمي معتمد" : "Globally Accredited Training");
  const statCoursesLabel = s("stat_courses", l === "ar" ? "دورة تدريبية" : "Training Courses");
  const statVenuesLabel = s("stat_venues", l === "ar" ? "مدينة" : "Global Venues");
  const statSubjectsLabel = s("stat_subjects", l === "ar" ? "تخصص" : "Subject Areas");
  const badgeAccredited = s("badge_accredited", l === "ar" ? "معتمدون عالمياً" : "Globally Accredited");
  const badgeTrainers = s("badge_trainers", l === "ar" ? "مدربون خبراء" : "Expert Trainers");
  const badgeProgrammes = s("badge_programmes", l === "ar" ? "برامج عملية" : "Practical Programmes");
  const formatClassroomTitle = s("format_classroom_title", l === "ar" ? "قاعات تدريب" : "Classroom Training");
  const formatClassroomDesc = s("format_classroom_desc", l === "ar" ? "تعلم وجهاً لوجه في مدننا العالمية." : "Learn in-person at our world-class venues in Dubai, London, and beyond.");
  const formatOnlineTitle = s("format_online_title", l === "ar" ? "تدريب أونلاين" : "Online Live Sessions");
  const formatOnlineDesc = s("format_online_desc", l === "ar" ? "جلسات مباشرة مع خبرائنا." : "Join live virtual classrooms with expert instructors from anywhere.");
  const formatInhouseTitle = s("format_inhouse_title", l === "ar" ? "تدريب داخلي" : "In-House Training");
  const formatInhouseDesc = s("format_inhouse_desc", l === "ar" ? "برامج مخصصة لفريقك في موقعك." : "Tailored programmes delivered at your premises for your team.");

  return (
    <div className="bg-background">
      {/* ============ HERO ============ */}
      <section className="relative min-h-[600px] overflow-hidden bg-navy text-white lg:min-h-[680px]">
        {heroImage ? (
          <img
            src={heroImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            fetchPriority="high"
          />
        ) : null}
        <div className="hero-overlay absolute inset-0" />
        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-32 lg:pt-40">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-gold">
                <Award className="h-4 w-4" />
                {heroBadge}
              </span>
              <h1 className="mt-6 text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
                {s("hero_title", t("heroTitle"))}
              </h1>
              <p className="mt-5 max-w-xl text-lg text-white/80">
                {s("hero_subtitle", t("heroSubtitle"))}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/training-subjects"
                  className="inline-flex items-center gap-2 rounded-lg bg-brand px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
                >
                  {l === "ar" ? "تصفح الدورات" : "Browse Courses"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/contact-us"
                  className="rounded-lg border border-white/30 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/20"
                >
                  {t("requestCallback")}
                </Link>
              </div>
              <div className="mt-12 grid max-w-md grid-cols-3 gap-6">
                {[
                  { n: totalCourses, label: statCoursesLabel },
                  { n: totalVenues, label: statVenuesLabel },
                  { n: categories.length, label: statSubjectsLabel },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="text-3xl font-extrabold text-gold lg:text-4xl">+{item.n}</div>
                    <div className="mt-1 text-sm text-white/60">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white p-6 text-navy shadow-2xl lg:p-8">
              <h3 className="mb-4 text-lg font-bold text-navy">
                {l === "ar" ? "ابحث عن دورتك" : "Find Your Course"}
              </h3>
              <QuickSearch
                categories={categories.map((c) => ({ key: c.id, slug: c.slug, labelEn: c.nameEn, labelAr: c.nameAr }))}
                venues={allVenues.map((v) => ({ key: v.id, slug: v.slug, labelEn: v.nameEn }))}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ============ CATEGORIES ============ */}
      <section className="section-divider mx-auto max-w-7xl px-4 py-20">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-brand">{l === "ar" ? "تخصصاتنا" : "Training Categories"}</span>
            <h2 className="mt-2 text-3xl font-bold text-navy sm:text-4xl">{s("section_categories", t("categoriesTitle"))}</h2>
          </div>
          <Link href="/training-subjects" className="hidden items-center gap-1 text-sm font-semibold text-brand hover:underline sm:inline-flex">
            {l === "ar" ? "عرض الكل" : "View all"} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((c) => {
            const count = counts[c.id] ?? 0;
            return (
              <Link
                key={c.id}
                href={`/training-courses/${c.slug}`}
                className="group relative overflow-hidden rounded-xl border bg-white p-5 transition-all hover:-translate-y-1 hover:border-brand hover:shadow-lg"
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-brand opacity-0 transition-opacity group-hover:opacity-100" />
                {c.icon ? (
                  <img src={c.icon} alt="" className="h-10 w-10 rounded-lg object-contain" />
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-light text-brand">
                    <UsersIcon size={20} />
                  </div>
                )}
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
      <section className="section-divider bg-muted/40 py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-sm font-semibold uppercase tracking-wider text-brand">{l === "ar" ? "أماكن التدريب" : "Training Locations"}</span>
              <h2 className="mt-2 text-3xl font-bold text-navy sm:text-4xl">{s("section_venues", t("venuesTitle"))}</h2>
            </div>
            <Link href="/training" className="hidden items-center gap-1 text-sm font-semibold text-brand hover:underline sm:inline-flex">
              {l === "ar" ? "كل المواقع" : "All venues"} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
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

      {/* ============ COUNTRIES ============ */}
      <section className="section-divider mx-auto max-w-7xl px-4 py-20">
        <div className="text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-brand">{t("countriesSubtitle")}</span>
          <h2 className="mt-2 text-3xl font-bold text-navy sm:text-4xl">{t("countriesTitle")}</h2>
        </div>
        <div className="mt-10">
          <CountriesGrid countries={countries} locale={l} compact />
        </div>
        <div className="mt-8 text-center">
          <Link href="/countries" className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline">
            {l === "ar" ? "عرض كل الدول" : "View all countries"} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ============ FORMATS ============ */}
      <section className="section-divider mx-auto max-w-7xl px-4 py-20">
        <div className="text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-brand">{l === "ar" ? "طرق التدريب" : "Training Formats"}</span>
          <h2 className="mt-2 text-3xl font-bold text-navy sm:text-4xl">{s("section_formats", t("formatsTitle"))}</h2>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            { icon: Building2, title: formatClassroomTitle, desc: formatClassroomDesc },
            { icon: MonitorPlay, title: formatOnlineTitle, desc: formatOnlineDesc },
            { icon: UsersIcon, title: formatInhouseTitle, desc: formatInhouseDesc },
          ].map((f) => (
            <div key={f.title} className="rounded-xl border bg-white p-8 text-center transition-shadow hover:shadow-lg">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-light text-brand">
                <f.icon size={28} />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-navy">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ FEATURED COURSES ============ */}
      <section className="section-divider bg-navy py-20 text-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-sm font-semibold uppercase tracking-wider text-gold">{l === "ar" ? "دورات مميزة" : "Popular Courses"}</span>
              <h2 className="mt-2 text-3xl font-bold sm:text-4xl">{s("section_featured", t("featuredTitle"))}</h2>
            </div>
            <Link href="/new-training-courses" className="hidden items-center gap-1 text-sm font-semibold text-gold hover:underline sm:inline-flex">
              {l === "ar" ? "عرض الكل" : "View all"} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((c) => {
              const next = c.schedules[0];
              return (
                <div key={c.id} className="group overflow-hidden rounded-xl bg-white text-navy transition-all hover:-translate-y-1 hover:shadow-2xl">
                  {c.image && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={c.image}
                        alt=""
                        className="course-card-img h-full w-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <Badge variant="outline" className="absolute left-3 top-3 border-white/30 bg-white/90 text-navy">{c.code}</Badge>
                    </div>
                  )}
                  <div className="flex flex-col p-5">
                    {!c.image && <Badge variant="outline" className="mb-3 w-fit border-brand/30 text-brand">{c.code}</Badge>}
                    <Link href={`/training-course/${c.slug}`} className="flex-1">
                      <h3 className="text-lg font-semibold leading-snug text-navy transition-colors group-hover:text-brand">
                        {localeText({ en: c.titleEn, ar: c.titleAr }, l)}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {localeText({ en: c.subtitleEn, ar: c.subtitleAr }, l)}
                      </p>
                    </Link>
                    {next && (
                      <div className="mt-4 space-y-2 border-t pt-4 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <CalendarDays size={15} className="shrink-0 text-brand" />
                          {formatDateRange(next.startDate, next.endDate, l)}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Globe2 size={15} className="shrink-0 text-brand" />
                            {next.venue.nameEn}
                          </div>
                          <span className="font-bold text-navy">{formatCurrency(Number(next.fee), next.currency)}</span>
                        </div>
                      </div>
                    )}
                    <Link
                      href={`/training-course/${c.slug}`}
                      className="mt-4 inline-flex items-center justify-center rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
                    >
                      {tc("registerNow")}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ ABOUT + TESTIMONIALS ============ */}
      <section className="section-divider mx-auto max-w-7xl px-4 py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-brand">{l === "ar" ? "من نحن" : "Why Takween"}</span>
            <h2 className="mt-2 text-3xl font-bold text-navy sm:text-4xl">{s("section_about", t("aboutTitle"))}</h2>
            <p className="mt-5 leading-relaxed text-muted-foreground">
              {s(
                "about_text",
                l === "ar"
                  ? "نحن شركة عالمية رائدة في التدريب المهني، نقدّم أكثر من 1000 دورة في مدن حول العالم، معتمدين على مدربين خبراء ومناهج عملية تدريب."
                  : "We are a leading professional training provider, delivering over 1000 courses across cities worldwide, powered by expert trainers and hands-on, practical curricula."
              )}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {[
                { icon: ShieldCheck, label: badgeAccredited },
                { icon: Users, label: badgeTrainers },
                { icon: Award, label: badgeProgrammes },
              ].map((f) => (
                <span key={f.label} className="inline-flex items-center gap-2 rounded-full bg-brand-light px-4 py-2 text-sm font-medium text-navy">
                  <CheckCircle2 size={16} className="text-brand" />
                  {f.label}
                </span>
              ))}
            </div>
            <Link href="/about-us" className="mt-8 inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline">
              {l === "ar" ? "اقرأ المزيد" : "Read more"} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {testimonials.length > 0 && (
            <div className="space-y-5">
              {testimonials.slice(0, 3).map((tm) => (
                <figure key={tm.id} className="rounded-xl border bg-white p-6 transition-shadow hover:shadow-md">
                  <Quote className="h-6 w-6 text-brand/30" />
                  <blockquote className="mt-2 text-sm leading-relaxed text-navy">
                    {localeText({ en: tm.textEn, ar: tm.textAr }, l)}
                  </blockquote>
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
      <section className="section-divider bg-navy py-20 text-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-sm font-semibold uppercase tracking-wider text-gold">{l === "ar" ? "الشهادات" : "Professional Certificates"}</span>
              <h2 className="mt-2 text-3xl font-bold sm:text-4xl">{s("section_certificates", t("certificatesTitle"))}</h2>
            </div>
            <Link href="/certificates" className="hidden items-center gap-1 text-sm font-semibold text-gold hover:underline sm:inline-flex">
              {l === "ar" ? "كل الشهادات" : "All certificates"} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {certificates.map((c) => (
              <Link
                key={c.id}
                href={`/certified-courses/${c.slug}`}
                className="group flex items-center gap-3 rounded-xl border border-white/15 bg-white/5 p-5 transition-all hover:border-gold hover:bg-white/10 hover:text-gold"
              >
                {c.logo ? (
                  <img src={c.logo} alt="" className="h-10 w-10 rounded object-contain" />
                ) : null}
                <span className="text-sm font-medium text-white/90 group-hover:text-gold">
                  {localeText({ en: c.nameEn, ar: c.nameAr }, l)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CLIENTS ============ */}
      {clients.length > 0 && (
        <section className="section-divider bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 text-center">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{s("section_clients", t("clientsTitle"))}</h3>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
              {clients.map((c) => (
                <span key={c.id} className="text-lg font-bold uppercase tracking-wide text-gray-300 transition-colors hover:text-gray-400">
                  {c.logo ? (
                    <img src={c.logo} alt={c.nameEn} className="h-8 w-auto object-contain opacity-40 grayscale" />
                  ) : (
                    c.nameEn
                  )}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ ARTICLES / INSIGHTS ============ */}
      {articles.length > 0 && (
        <section className="section-divider mx-auto max-w-7xl px-4 py-20">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-sm font-semibold uppercase tracking-wider text-brand">{l === "ar" ? "المدونة" : "Latest Insights"}</span>
              <h2 className="mt-2 text-3xl font-bold text-navy sm:text-4xl">{s("section_articles", t("articlesTitle"))}</h2>
            </div>
            <Link href="/resources" className="hidden items-center gap-1 text-sm font-semibold text-brand hover:underline sm:inline-flex">
              {l === "ar" ? "كل المقالات" : "All articles"} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {articles.map((a) => (
              <Link key={a.id} href={`/resources/${a.slug}`} className="group overflow-hidden rounded-xl border bg-white transition-all hover:-translate-y-1 hover:shadow-lg">
                {a.image && (
                  <div className="relative h-44 overflow-hidden">
                    <img src={a.image} alt="" className="course-card-img h-full w-full object-cover" loading="lazy" />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="font-semibold leading-snug text-navy group-hover:text-brand">
                    {localeText({ en: a.titleEn, ar: a.titleAr }, l)}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {localeText({ en: a.excerptEn, ar: a.excerptAr }, l)}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand">
                    {l === "ar" ? "اقرأ المزيد" : "Read more"} <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ============ CTA ============ */}
      <section className="bg-brand">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-12 text-center text-white sm:flex-row sm:text-left">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">{s("cta_title", l === "ar" ? "جاهز لتطوير مهاراتك؟" : "Ready to advance your career?")}</h2>
            <p className="mt-1 text-white/80">{s("cta_subtitle", l === "ar" ? "تواصل مع مستشارينا التدريبيين اليوم." : "Talk to our training advisors today.")}</p>
          </div>
          <Link href="/contact-us" className="shrink-0 rounded-lg bg-white px-7 py-3 text-sm font-semibold text-brand transition-colors hover:bg-brand-light">
            {l === "ar" ? "اتصل بنا" : "Contact us"}
          </Link>
        </div>
      </section>
    </div>
  );
}
