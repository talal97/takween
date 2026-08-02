import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { localeText } from "@/lib/data";

export default async function TrainingSubjectsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l = (locale === "ar" ? "ar" : "en") as "en" | "ar";
  setRequestLocale(locale);
  const groups = await prisma.superCategory.findMany({
    orderBy: { sort: "asc" },
    include: { categories: { orderBy: { nameEn: "asc" } } },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold text-navy">{l === "ar" ? "الموضوعات التدريبية" : "Training Subjects"}</h1>
      <div className="mt-8 space-y-10">
        {groups.map((g) => (
          <section key={g.id}>
            <Link href={`/training-subjects/${g.slug}`}>
              <h2 className="text-xl font-bold text-navy hover:text-brand">{localeText({ en: g.nameEn, ar: g.nameAr }, l)}</h2>
            </Link>
            <div className="mt-3 flex flex-wrap gap-2">
              {g.categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/training-courses/${c.slug}`}
                  className="rounded-full border px-4 py-2 text-sm text-muted-foreground hover:border-brand hover:text-brand"
                >
                  {localeText({ en: c.nameEn, ar: c.nameAr }, l)}
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}