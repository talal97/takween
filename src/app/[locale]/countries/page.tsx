import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { getCountriesCached } from "@/lib/data";
import { PageHeader } from "@/components/site/page-header";
import { CountriesGrid } from "@/components/site/countries-grid";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "الدول" : "Countries",
    description: locale === "ar" ? "الدول التي نقدم فيها التدريب" : "Countries where we deliver professional training",
    alternates: { canonical: "/countries" },
  };
}

export default async function CountriesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l = (locale === "ar" ? "ar" : "en") as "en" | "ar";
  setRequestLocale(locale);

  const countries = await getCountriesCached();

  return (
    <div>
      <PageHeader
        title={l === "ar" ? "الدول التي نعمل فيها" : "Countries We Operate In"}
        subtitle={l === "ar" ? "تدريب يمتد عبر 5 قارات" : "Training delivered across 5 continents"}
      />
      <div className="mx-auto max-w-7xl px-4 py-12">
        <CountriesGrid countries={countries} locale={l} />
      </div>
    </div>
  );
}
