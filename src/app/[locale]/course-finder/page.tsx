import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { localeText } from "@/lib/data";
import { formatDateRange } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Globe2, Search } from "lucide-react";

export default async function CourseFinderPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const l = (locale === "ar" ? "ar" : "en") as "en" | "ar";
  setRequestLocale(locale);
  const t = await getTranslations("common");
  const sp = await searchParams;
  const q = ((sp.q as string) || "").trim().toLowerCase();

  const localeFilter = l === "ar" ? { in: ["ar", "both"] } : { in: ["en", "both"] };

  const courses = q
    ? await prisma.course.findMany({
        where: {
          locale: localeFilter,
          OR: [
            { titleEn: { contains: q, mode: "insensitive" } },
            { titleAr: { contains: q, mode: "insensitive" } },
            { subtitleEn: { contains: q, mode: "insensitive" } },
            { code: { contains: q, mode: "insensitive" } },
          ],
        },
        include: { schedules: { include: { venue: true }, orderBy: { startDate: "asc" } }, category: true },
        take: 40,
      })
    : await prisma.course.findMany({
        where: { locale: localeFilter },
        include: { schedules: { include: { venue: true }, orderBy: { startDate: "asc" } }, category: true },
        take: 60,
      });

  return (
    <div>
      <section className="bg-navy pb-10 pt-28 text-white">
        <div className="mx-auto max-w-7xl px-4">
          <h1 className="text-3xl font-bold sm:text-4xl">{t("courseFinder")}</h1>
          <p className="mt-2 text-white/70">{l === "ar" ? "ابحث عن دورة بالكلمة المفتاحية أو الكود أو العنوان" : "Search courses by keyword, code or title"}</p>
          <form method="get" className="mt-6 flex max-w-2xl gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                name="q"
                defaultValue={q}
                placeholder={l === "ar" ? "ابحث عن دورة..." : "Search for a course..."}
                className="h-12 w-full rounded-lg border border-white/20 bg-white/10 pl-10 pr-4 text-sm text-white placeholder:text-white/50 outline-none focus:border-brand focus:bg-white/15"
              />
            </div>
            <button type="submit" className="h-12 rounded-lg bg-brand px-6 text-sm font-semibold text-white hover:bg-brand-dark">
              {t("search")}
            </button>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        {q && <p className="mb-4 text-sm text-muted-foreground">{courses.length} {l === "ar" ? "نتيجة" : "results"}</p>}
        {!q && (
          <p className="mb-4 text-sm text-muted-foreground">
            {l === "ar" ? "اكتب كلمة للبحث عن الدورات" : "Type a keyword to search for courses"}
          </p>
        )}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => {
            const next = c.schedules[0];
            return (
              <Link key={c.id} href={`/training-course/${c.slug}`} className="group overflow-hidden rounded-xl border bg-white transition-all hover:-translate-y-1 hover:shadow-lg">
                {c.image && (
                  <div className="relative h-44 overflow-hidden">
                    <img src={c.image} alt="" className="course-card-img h-full w-full object-cover" loading="lazy" />
                  </div>
                )}
                <div className="p-5">
                  {c.category && (
                    <Badge variant="secondary" className="mb-2 text-xs">{localeText({ en: c.category.nameEn, ar: c.category.nameAr }, l)}</Badge>
                  )}
                  <h3 className="font-semibold leading-snug text-navy group-hover:text-brand">
                    {localeText({ en: c.titleEn, ar: c.titleAr }, l)}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {localeText({ en: c.subtitleEn, ar: c.subtitleAr }, l)}
                  </p>
                  {next && (
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><CalendarDays size={13} className="text-brand" /> {formatDateRange(next.startDate, next.endDate, l)}</span>
                      <span className="flex items-center gap-1"><Globe2 size={13} className="text-brand" /> {next.venue.nameEn}</span>
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
