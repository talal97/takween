import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { localeText } from "@/lib/data";

export default async function TrainingVenuesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l = (locale === "ar" ? "ar" : "en") as "en" | "ar";
  setRequestLocale(locale);
  const regions = await prisma.region.findMany({
    orderBy: { sort: "asc" },
    include: { venues: { orderBy: { nameEn: "asc" } } },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold text-navy">{l === "ar" ? "أماكن التدريب" : "Training Venues"}</h1>
      <div className="mt-8 space-y-10">
        {regions.map((r) => (
          <section key={r.id}>
            <h2 className="text-xl font-bold text-navy">{localeText({ en: r.nameEn, ar: r.nameAr }, l)}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {r.venues.map((v) => (
                <Link
                  key={v.id}
                  href={`/training/${v.slug}`}
                  className="rounded-full border px-4 py-2 text-sm text-muted-foreground hover:border-brand hover:text-brand"
                >
                  {v.nameEn}
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}