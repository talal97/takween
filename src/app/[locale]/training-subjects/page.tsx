import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { getSettingsCached } from "@/lib/settings";
import { localeText } from "@/lib/data";
import { ArrowRight } from "lucide-react";
import { Breadcrumb } from "@/components/site/breadcrumb";
import { buildPageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const title = locale === "ar" ? "الموضوعات التدريبية" : "Training Subjects";
  const description = locale === "ar" ? "تصفح تخصصاتنا التدريبية" : "Browse our training categories and find the right course for you";
  return buildPageMetadata({ title, description, locale, path: "/training-subjects" });
}

export default async function TrainingSubjectsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l = (locale === "ar" ? "ar" : "en") as "en" | "ar";
  setRequestLocale(locale);

  const [settings] = await Promise.all([getSettingsCached()]);
  const s = (k: string, fb: string) => settings[`${k}_${l}`] || fb;

  const localeFilter = l === "ar" ? { in: ["ar", "both"] } : { in: ["en", "both"] };

  const groups = await prisma.superCategory.findMany({
    orderBy: { sort: "asc" },
    include: {
      categories: {
        orderBy: { nameEn: "asc" },
        where: { courses: { some: { locale: localeFilter } } },
        include: { _count: { select: { courses: true } } },
      },
    },
  });

  const filteredGroups = groups.filter((g) => g.categories.length > 0);

  return (
    <div>
      <Breadcrumb />
      <section className="bg-navy pb-10 pt-28 text-white">
        <div className="mx-auto max-w-7xl px-4">
          <h1 className="text-3xl font-bold sm:text-4xl">{s("page_subjects_title", l === "ar" ? "الموضوعات التدريبية" : "Training Subjects")}</h1>
          <p className="mt-2 text-white/70">{s("page_subjects_subtitle", l === "ar" ? "تصفح تخصصاتنا التدريبية" : "Browse our training categories and find the right course for you")}</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="space-y-12">
          {filteredGroups.map((g) => (
            <section key={g.id} className="section-divider pt-10">
              <Link href={`/training-subjects/${g.slug}`} className="group flex items-center gap-3">
                {g.image && (
                  <img src={g.image} alt="" className="h-8 w-8 rounded-lg object-contain" />
                )}
                <h2 className="text-2xl font-bold text-navy transition-colors group-hover:text-brand">
                  {localeText({ en: g.nameEn, ar: g.nameAr }, l)}
                </h2>
                <ArrowRight className="h-5 w-5 text-brand opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {g.categories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/training-courses/${c.slug}`}
                    className="group flex items-center gap-3 rounded-xl border bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-brand hover:shadow-md"
                  >
                    {c.icon ? (
                      <img src={c.icon} alt="" className="h-9 w-9 rounded-lg object-contain" />
                    ) : (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-light text-brand text-xs font-bold">
                        {localeText({ en: c.nameEn, ar: c.nameAr }, l).charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-navy group-hover:text-brand">
                        {localeText({ en: c.nameEn, ar: c.nameAr }, l)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {c._count.courses} {l === "ar" ? "دورة" : "courses"}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>
    </div>
  );
}
