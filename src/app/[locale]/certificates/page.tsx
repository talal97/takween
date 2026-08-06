import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { getSettingsCached } from "@/lib/settings";
import { localeText } from "@/lib/data";
import { PageHeader } from "@/components/site/page-header";
import { Breadcrumb } from "@/components/site/breadcrumb";
import { buildPageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const l = locale === "ar" ? "ar" : "en";
  const settings = await getSettingsCached();
  const title = settings[`page_certificates_title_${l}`] || (l === "ar" ? "الشهادات" : "Certificates");
  const description = settings[`page_certificates_subtitle_${l}`] || (l === "ar" ? "احصل على شهادات مهنية معترف بها عالمياً" : "Obtain globally recognised professional certificates");
  return buildPageMetadata({ title, description, locale, path: "/certificates" });
}

export default async function CertificatesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l = (locale === "ar" ? "ar" : "en") as "en" | "ar";
  setRequestLocale(locale);
  const [certs, settings] = await Promise.all([
    prisma.certificate.findMany({ orderBy: { sort: "asc" } }),
    getSettingsCached(),
  ]);
  const s = (k: string, fb: string) => settings[`${k}_${l}`] || fb;

  return (
    <div>
      <Breadcrumb />
      <PageHeader
        title={s("page_certificates_title", l === "ar" ? "الشهادات" : "Certificates")}
        subtitle={s("page_certificates_subtitle", l === "ar" ? "احصل على شهادات مهنية معترف بها عالمياً" : "Obtain globally recognised professional certificates")}
      />
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {certs.map((c) => (
            <Link key={c.id} href={`/certified-courses/${c.slug}`} className="group rounded-lg border p-5 transition-shadow hover:shadow-md">
              <div className="font-semibold text-navy group-hover:text-brand">{localeText({ en: c.nameEn, ar: c.nameAr }, l)}</div>
              <div className="mt-1 text-sm text-muted-foreground">{c.description || c.code}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
