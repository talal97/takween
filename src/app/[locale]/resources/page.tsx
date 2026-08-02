import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { localeText } from "@/lib/data";
import { readableDate } from "@/lib/utils";
import { Download } from "lucide-react";

export default async function ResourcesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l = (locale === "ar" ? "ar" : "en") as "en" | "ar";
  setRequestLocale(locale);
  const [articles, downloads] = await Promise.all([
    prisma.article.findMany({ where: { status: "published" }, orderBy: { publishedAt: "desc" } }),
    prisma.download.findMany({ orderBy: { sort: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold text-navy">{l === "ar" ? "الموارد" : "Resources"}</h1>

      {downloads.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-4 text-xl font-semibold text-navy">{l === "ar" ? "الكتالوجات والمنشورات" : "Catalogues & Downloads"}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {downloads.map((d) => (
              <a key={d.id} href={d.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-4 rounded-lg border p-4 transition-all hover:border-brand hover:bg-brand-light/40">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-light text-brand">
                  <Download size={20} />
                </span>
                <span>
                  <span className="block font-medium text-navy">{localeText({ en: d.titleEn, ar: d.titleAr }, l)}</span>
                  <span className="mt-0.5 block text-xs uppercase tracking-wide text-muted-foreground">{d.type}</span>
                </span>
              </a>
            ))}
          </div>
        </section>
      )}

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {articles.map((a) => (
          <Link key={a.id} href={`/resources/${a.slug}`} className="group rounded-lg border p-5 transition-shadow hover:shadow-md">
            <div className="text-sm text-muted-foreground">{readableDate(a.publishedAt, l)}</div>
            <h3 className="mt-2 font-semibold text-navy group-hover:text-brand">{localeText({ en: a.titleEn, ar: a.titleAr }, l)}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{localeText({ en: a.excerptEn, ar: a.excerptAr }, l)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}