import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { localeText } from "@/lib/data";
import { formatDateRange } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

  const courses = q
    ? await prisma.course.findMany({
        where: {
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
    : await prisma.course.findMany({ include: { schedules: { include: { venue: true }, orderBy: { startDate: "asc" } }, category: true }, take: 60 });

  return (
    <div>
      <section className="bg-muted/50">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <h1 className="text-3xl font-bold text-navy">{t("courseFinder")}</h1>
          <p className="mt-2 text-muted-foreground">{t("search")} courses by keyword, code or title</p>
          <form method="get" className="mt-5 flex max-w-2xl gap-2">
            <input
              name="q"
              defaultValue={q}
              placeholder={l === "ar" ? "ابحث عن دورة..." : "Search for a course..."}
              className="h-12 flex-1 rounded-lg border border-input bg-white px-4 text-sm outline-none focus:border-brand"
            />
            <button type="submit" className="h-12 rounded-lg bg-brand px-5 text-sm font-semibold text-white hover:bg-brand/90">
              {t("search")}
            </button>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-4 px-4 py-8">
        {q && <p className="text-sm text-muted-foreground">{q ? `${courses.length} results` : ""}</p>}
        {q.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              {l === "ar" ? "اكتب كلمة للبحث عن الدورات" : "Type a keyword to search for courses"}
            </CardContent>
          </Card>
        )}
        {courses.map((c) => {
          const next = c.schedules[0];
          return (
            <Card key={c.id}>
              <CardContent className="pt-6">
                <Link href={`/training-course/${c.slug}`} className="group">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-semibold text-navy group-hover:text-brand">{localeText({ en: c.titleEn, ar: c.titleAr }, l)}</div>
                      <div className="mt-1 text-sm text-muted-foreground">{localeText({ en: c.subtitleEn, ar: c.subtitleAr }, l)}</div>
                    </div>
                    {c.category && <Badge variant="secondary">{localeText({ en: c.category.nameEn, ar: c.category.nameAr }, l)}</Badge>}
                  </div>
                  {next && (
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                      <Badge variant="secondary">{formatDateRange(next.startDate, next.endDate, l)}</Badge>
                      <Badge variant="secondary">{next.venue.nameEn}</Badge>
                    </div>
                  )}
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </section>
    </div>
  );
}