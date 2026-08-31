import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { localeText, getCountriesCached } from "@/lib/data";
import { PageHeader } from "@/components/site/page-header";
import { CountriesGrid } from "@/components/site/countries-grid";
import { Breadcrumb } from "@/components/site/breadcrumb";
import { buildPageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const title = locale === "ar" ? "أماكن التدريب" : "Training Venues";
  const description = locale === "ar" ? "اختر مدينتك وابدأ رحلتك التدريبية اليوم" : "Choose your venue and start your training journey today";
  return buildPageMetadata({ title, description, locale, path: "/training" });
}

export default async function TrainingVenuesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l = (locale === "ar" ? "ar" : "en") as "en" | "ar";
  setRequestLocale(locale);

  const [regions, countries] = await Promise.all([
    prisma.region.findMany({
      orderBy: { sort: "asc" },
      include: { venues: { orderBy: { nameEn: "asc" } } },
    }),
    getCountriesCached(),
  ]);

  return (
    <div>
      <Breadcrumb />
      <PageHeader
        title={l === "ar" ? "أماكن التدريب" : "Training Venues"}
        subtitle={l === "ar" ? "اختر مدينتك وابدأ رحلتك التدريبية اليوم" : "Choose your venue and start your training journey today"}
      />
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-navy">{l === "ar" ? "الدول" : "Countries"}</h2>
          <CountriesGrid countries={countries} locale={l} />
        </div>
        <div>
          <h2 className="mb-6 text-2xl font-bold text-navy">{l === "ar" ? "أماكن التدريب" : "Training Venues"}</h2>
          <div className="space-y-8">
            {regions.map((r) => (
              <section key={r.id}>
                <h3 className="text-lg font-semibold text-navy">{localeText({ en: r.nameEn, ar: r.nameAr }, l)}</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {r.venues.map((v) => (
                    <Link
                      key={v.id}
                      href={`/training/${v.slug}`}
                      className="rounded-full border px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-brand hover:bg-brand-light hover:text-navy"
                    >
                      {v.nameEn}
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}