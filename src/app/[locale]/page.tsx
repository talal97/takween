import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { getSettingsCached } from "@/lib/settings";
import { localeText, getHomePageDataCached, getCountriesCached } from "@/lib/data";
import { formatDateRange, formatCurrency } from "@/lib/utils";
import { HeroSearch } from "@/components/site/hero-search";
import { CountriesGrid } from "@/components/site/countries-grid";
import {
  CalendarDays,
  Award,
  Building2,
  MonitorPlay,
  Users,
  Globe2,
  ShieldCheck,
  Quote,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Handshake,
} from "lucide-react";

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

  const settings = await getSettingsCached();
  const s = (k: string, fb: string) => settings[`${k}_${l}`] || fb;
  const heroImage = settings.hero_image || "";

  const {
    superCategories,
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

  const flatCategories = superCategories.flatMap((sc) => sc.categories);
  const totalCategories = flatCategories.length;

  const statCoursesLabel = s("stat_courses", l === "ar" ? "دورة تدريبية" : "Training Courses");
  const statVenuesLabel = s("stat_venues", l === "ar" ? "مدينة حول العالم" : "Cities Worldwide");
  const statSubjectsLabel = s("stat_subjects", l === "ar" ? "تخصص تدريبي" : "Subject Areas");

  const badgeAccredited = s("badge_accredited", l === "ar" ? "معتمدون عالمياً" : "Globally Accredited");
  const badgeTrainers = s("badge_trainers", l === "ar" ? "مدربون خبراء" : "Expert Trainers");
  const badgeProgrammes = s("badge_programmes", l === "ar" ? "برامج عملية" : "Practical Programmes");

  const formatNewTitle = s("format_new_title", l === "ar" ? "دورات جديدة" : "New Courses");
  const formatNewDesc = s("format_new_desc", l === "ar" ? "اطّلع على أحدث برامجنا التدريبية المُضافة حديثاً." : "Discover our latest training programmes, added regularly.");
  const formatInhouseTitle = s("format_inhouse_title", l === "ar" ? "التدريب التعاقدي" : "In-House Training");
  const formatInhouseDesc = s("format_inhouse_desc", l === "ar" ? "برامج مصمّمة خصيصاً لتلبية احتياجات مؤسستك، تُقدَّم في موقعكم." : "Programmes tailored to your organisation's needs, delivered at your premises.");
  const formatOnlineTitle = s("format_online_title", l === "ar" ? "التدريب عن بُعد" : "Online Training");
  const formatOnlineDesc = s("format_online_desc", l === "ar" ? "انضم إلى جلسات تدريبية مباشرة مع نخبة المدربين من أي مكان." : "Join live training sessions with expert trainers from anywhere.");
  const formatClassroomTitle = s("format_classroom_title", l === "ar" ? "التدريب الحضوري" : "Classroom Training");
  const formatClassroomDesc = s("format_classroom_desc", l === "ar" ? "تعلّم وجهاً لوجه في أفضل مراكزنا التدريبية حول العالم." : "Learn face-to-face at our world-class venues around the world.");

  const heroTitle = s(
    "hero_title",
    l === "ar"
      ? `استكشف أكثر من ${totalCourses}+ دورة تدريبية مصمّمة وفق أعلى المعايير العالمية`
      : `Explore ${totalCourses}+ Training Courses Designed to the Highest Global Standards`
  );
  const heroSubtitle = s(
    "hero_subtitle",
    l === "ar"
      ? "طوّر مهاراتك وقُد الابتكار في مؤسستك من خلال برامج تدريبية عملية ومتخصصة، تهدف إلى تمكين الأفراد وتعزيز قدرات المؤسسات."
      : "Develop your skills and lead innovation in your organisation through practical, specialised training programmes designed to empower individuals and strengthen organisational capability."
  );

  const categoriesTitle = s(
    "section_categories",
    l === "ar" ? `اختر من بين أكثر من ${totalCourses}+ برنامج تدريبي` : `Choose From Over ${totalCourses}+ Training Programmes`
  );
  const certificatesTitle = s("section_certificates", l === "ar" ? "طوّر مسيرتك المهنية بشهادات معتمدة" : "Advance Your Career With Accredited Certificates");
  const formatsTitle = s("section_formats", l === "ar" ? "اختر أسلوب التدريب الذي يناسب مسيرتك المهنية" : "Choose the Training Format That Fits Your Career Path");
  const featuredTitle = s("section_featured", t("featuredTitle"));
  const aboutTitle = s("section_about", t("aboutTitle"));
  const clientsTitle = s("section_clients", l === "ar" ? "الشريك الموثوق لعشرات المؤسسات" : "A Trusted Partner to Dozens of Organisations");
  const articlesTitle = s("section_articles", t("articlesTitle"));

  const formats = [
    { icon: Sparkles, title: formatNewTitle, desc: formatNewDesc, href: "/new-training-courses" },
    { icon: Handshake, title: formatInhouseTitle, desc: formatInhouseDesc, href: "/contact-us" },
    { icon: MonitorPlay, title: formatOnlineTitle, desc: formatOnlineDesc, href: "/training-courses" },
    { icon: Building2, title: formatClassroomTitle, desc: formatClassroomDesc, href: "/training" },
  ];

  return (
    <div className="bg-background">
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden bg-navy text-white">
        {heroImage ? (
          <img
            src={heroImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            fetchPriority="high"
          />
        ) : null}
        <div className="hero-overlay absolute inset-0" />
        <div className="relative mx-auto max-w-3xl px-4 pb-14 pt-32 text-center lg:pt-40">
          <h1 className="text-2xl font-bold leading-tight sm:text-3xl md:text-4xl">{heroTitle}</h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/80 sm:text-lg">{heroSubtitle}</p>

          <div className="mt-8">
            <HeroSearch />
          </div>

          <div className="mx-auto mt-10 flex max-w-lg items-center justify-center divide-x divide-white/15 rtl:divide-x-reverse">
            {[
              { n: totalCourses, label: statCoursesLabel },
              { n: totalVenues, label: statVenuesLabel },
              { n: totalCategories, label: statSubjectsLabel },
            ].map((item) => (
              <div key={item.label} className="flex-1 px-4 text-center first:ps-0 last:pe-0">
                <div className="text-2xl font-extrabold text-gold">+{item.n}</div>
                <div className="mt-1 text-xs text-white/60">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CATEGORIES ============ */}
      <section className="section-divider mx-auto max-w-7xl px-4 py-15">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-brand">{l === "ar" ? "المجالات التدريبية" : "Training Areas"}</span>
          <h2 className="mt-2 text-2xl font-semibold text-navy md:text-3xl">{categoriesTitle}</h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            {l === "ar"
              ? "صمّمنا مجموعة متكاملة من البرامج التدريبية تغطي مختلف المجالات المهنية لتناسب احتياجات الأفراد والمؤسسات على حدٍّ سواء. مهما كان تخصصك أو طموحك المهني، ستجد لدينا البرنامج المناسب."
              : "We've built a comprehensive set of training programmes spanning every professional field, tailored to the needs of individuals and organisations alike. Whatever your specialism or career ambition, you'll find the right programme with us."}
          </p>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {superCategories.filter((sc) => sc.categories.length > 0).map((sc) => (
            <Link
              key={sc.id}
              href={`/training-subjects/${sc.slug}`}
              className="group flex items-center gap-3 rounded-md bg-muted p-3 transition-colors hover:bg-brand-light rtl:flex-row-reverse"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-navy group-hover:text-brand">
                  {localeText({ en: sc.nameEn, ar: sc.nameAr }, l)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {sc.categories.reduce((sum, c) => sum + c._count.courses, 0)} {l === "ar" ? "دورة" : "courses"}
                </div>
              </div>
              {sc.icon ? (
                <img src={sc.icon} alt="" className="h-9 w-9 shrink-0 rounded-lg object-contain" />
              ) : sc.image ? (
                <img src={sc.image} alt="" className="h-9 w-9 shrink-0 rounded-lg object-contain" />
              ) : (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-light text-brand text-sm font-bold">
                  {localeText({ en: sc.nameEn, ar: sc.nameAr }, l).charAt(0)}
                </div>
              )}
            </Link>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/training-subjects"
            className="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
          >
            {l === "ar" ? "عرض جميع الدورات التدريبية" : "View All Training Courses"}
          </Link>
        </div>
      </section>

      {/* ============ COUNTRIES ============ */}
      <section className="section-divider mx-auto max-w-7xl px-4 py-15">
        <div className="text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-brand">{t("countriesSubtitle")}</span>
          <h2 className="mt-2 text-2xl font-semibold text-navy md:text-3xl">{t("countriesTitle")}</h2>
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

      {/* ============ CERTIFICATES ============ */}
      <section className="section-divider mx-auto max-w-7xl px-4 py-15">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-brand">{l === "ar" ? "التطوير المهني" : "Professional Development"}</span>
          <h2 className="mt-2 text-2xl font-semibold text-navy md:text-3xl">{certificatesTitle}</h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            {l === "ar"
              ? "احصل على شهادة مهنية عند إتمام دورتك التدريبية، لتعزيز سيرتك الذاتية وترسيخ مكانتك ضمن المحترفين المعتمدين في مجالك."
              : "Earn a professional certificate on completion of your course, strengthening your CV and your standing among accredited professionals in your field."}
          </p>
        </div>
        <div className="mt-4 text-center">
          <Link href="/certificates" className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline">
            {l === "ar" ? "عرض جميع الشهادات" : "View all certificates"} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {certificates.map((c) => (
            <Link
              key={c.id}
              href={`/certified-courses/${c.slug}`}
              className="group flex items-center gap-3 rounded-md bg-muted p-3 transition-colors hover:bg-brand-light"
            >
              {c.logo ? (
                <img src={c.logo} alt="" className="h-10 w-10 rounded object-contain" />
              ) : null}
              <span className="text-sm font-medium text-navy group-hover:text-brand">
                {localeText({ en: c.nameEn, ar: c.nameAr }, l)}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ============ FORMATS ============ */}
      <section className="section-divider bg-muted/40 py-15">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-brand">{l === "ar" ? "طرق التدريب" : "Training Formats"}</span>
            <h2 className="mt-2 text-2xl font-semibold text-navy md:text-3xl">{formatsTitle}</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {l === "ar"
                ? "سواء فضّلت التعلم في القاعة، أو عن بُعد، أو برنامجاً مصمماً خصيصاً لمؤسستك، نوفّر لك المسار الأنسب لتحقيق أهدافك."
                : "Whether you prefer classroom learning, remote sessions, or a programme tailored to your organisation, we have the right path to help you reach your goals."}
            </p>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4 gap-y-6 lg:grid-cols-4">
            {formats.map((f) => (
              <div key={f.title} className="flex flex-col rounded-xl bg-white p-4 text-center transition-colors hover:bg-muted">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-light text-brand">
                  <f.icon size={22} />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-navy md:text-base">{f.title}</h3>
                <p className="mt-1.5 flex-1 text-xs leading-relaxed text-muted-foreground md:text-sm">{f.desc}</p>
                <Link href={f.href} className="mt-3 inline-flex items-center justify-center gap-1 text-xs font-medium text-brand hover:underline md:text-sm">
                  {l === "ar" ? "عرض الدورات" : "View Courses"} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FEATURED COURSES ============ */}
      <section className="section-divider bg-navy py-15 text-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-gold">{l === "ar" ? "الأكثر طلباً" : "Most Popular"}</span>
            <h2 className="mt-2 text-2xl font-semibold md:text-3xl">{featuredTitle}</h2>
            <p className="mt-4 leading-relaxed text-white/70">
              {l === "ar"
                ? "تصفّح مجموعة مختارة من دوراتنا الأكثر طلباً هذا الموسم، والمصمّمة لتلبية احتياجات المهنيين والمؤسسات في مختلف القطاعات."
                : "Browse a curated selection of this season's most in-demand courses, designed to meet the needs of professionals and organisations across every sector."}
            </p>
          </div>
          <div className="mt-4 text-center">
            <Link href="/new-training-courses" className="inline-flex items-center gap-1 text-sm font-semibold text-gold hover:underline">
              {l === "ar" ? "عرض جميع الدورات" : "View all courses"} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 grid gap-x-10 md:grid-cols-2">
            {featured.map((c) => {
              const next = c.schedules[0];
              return (
                <Link
                  key={c.id}
                  href={`/training-course/${c.slug}`}
                  className="group flex items-center justify-between gap-4 border-b border-white/10 py-5 first:border-t"
                >
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold text-white transition-colors group-hover:text-gold">
                      {localeText({ en: c.titleEn, ar: c.titleAr }, l)}
                    </h3>
                    {next && (
                      <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/60">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays size={14} className="text-gold" />
                          {formatDateRange(next.startDate, next.endDate, l)}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Globe2 size={14} className="text-gold" />
                          {next.venue.nameEn}
                        </span>
                        <span className="font-semibold text-white/80">{formatCurrency(Number(next.fee), next.currency)}</span>
                      </p>
                    )}
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 -translate-x-1 text-gold opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100 rtl:translate-x-1 rtl:group-hover:translate-x-0" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ ABOUT + TESTIMONIALS ============ */}
      <section className="section-divider mx-auto max-w-7xl px-4 py-15">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-brand">{l === "ar" ? "من نحن" : "About Us"}</span>
            <h2 className="mt-2 text-2xl font-semibold text-navy md:text-3xl">{aboutTitle}</h2>
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
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/about-us" className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline">
                {l === "ar" ? "اقرأ المزيد" : "Read more"} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contact-us"
                className="inline-flex items-center gap-2 rounded-lg border border-brand px-5 py-2.5 text-sm font-semibold text-brand transition-colors hover:bg-brand-light"
              >
                {t("requestCallback")}
              </Link>
            </div>
          </div>

          {testimonials.length > 0 && (
            <div className="space-y-5">
              {testimonials.slice(0, 3).map((tm) => (
                <figure key={tm.id} className="rounded-xl bg-muted p-5 transition-colors hover:bg-brand-light/40">
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

      {/* ============ CLIENTS ============ */}
      {clients.length > 0 && (
        <section className="section-divider bg-white py-15">
          <div className="mx-auto max-w-7xl px-4 text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-brand">{l === "ar" ? "ثقة يعتد بها" : "Trusted By"}</span>
            <h2 className="mx-auto mt-2 max-w-2xl text-2xl font-semibold text-navy md:text-3xl">{clientsTitle}</h2>
            <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-muted-foreground">
              {l === "ar"
                ? "نفخر بثقة المؤسسات التي تعتمد على برامجنا التدريبية لتطوير كفاءات فرقها وتعزيز أدائها."
                : "We're proud of the trust organisations place in our training programmes to develop their teams' capabilities and boost performance."}
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
              {clients.map((c) => (
                <span key={c.id} className="text-lg font-bold uppercase tracking-wide text-gray-300 transition-colors hover:text-gray-400">
                  {c.logo ? (
                    <img src={c.logo} alt={c.nameEn} className="h-10 w-auto object-contain opacity-40 grayscale" />
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
        <section className="section-divider mx-auto max-w-7xl px-4 py-15">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-brand">{l === "ar" ? "المدونة" : "Insights"}</span>
            <h2 className="mt-2 text-2xl font-semibold text-navy md:text-3xl">{articlesTitle}</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              {l === "ar"
                ? "اطّلع على أحدث المقالات والرؤى من فريقنا لدعم تطورك المهني ومواكبة مستجدات مجالك."
                : "Explore our latest articles and insights to support your professional growth and keep up with developments in your field."}
            </p>
          </div>
          <div className="mt-4 text-center">
            <Link href="/resources" className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline">
              {l === "ar" ? "عرض جميع المقالات" : "View all articles"} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {articles.map((a) => (
              <Link key={a.id} href={`/resources/${a.slug}`} className="group overflow-hidden rounded-xl bg-white transition-colors hover:bg-muted">
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
          <Link href="/contact-us" className="shrink-0 rounded-md bg-white px-5 py-2.5 text-sm font-medium text-brand transition-colors hover:bg-brand-light">
            {l === "ar" ? "اتصل بنا" : "Contact us"}
          </Link>
        </div>
      </section>
    </div>
  );
}
