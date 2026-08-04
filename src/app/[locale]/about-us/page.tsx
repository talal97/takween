import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { localeText } from "@/lib/data";
import { getSettings } from "@/lib/settings";
import { PageHeader } from "@/components/site/page-header";

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l = (locale === "ar" ? "ar" : "en") as "en" | "ar";
  setRequestLocale(locale);
  const settings = await getSettings();
  const brand = settings.about_text || (l === "ar" ? "عن تكوين" : "About Takween");

  const [venues, categories, courses] = await Promise.all([
    prisma.venue.count(),
    prisma.category.count(),
    prisma.course.count(),
  ]);

  return (
    <div>
      <PageHeader
        title={l === "ar" ? "من نحن" : "About Us"}
        subtitle={l === "ar" ? "تعرف على تكوين ورؤيتها" : "Learn more about Takween and our vision"}
      />
      <div className="mx-auto max-w-4xl px-4 py-10">
        <p className="text-lg leading-relaxed text-muted-foreground">
          {localeText({ en: brand, ar: settings.about_text_ar }, l) || brand}
        </p>
        <div className="mt-10 grid grid-cols-3 gap-4">
          {[
            { n: courses, label: l === "ar" ? "الدورات" : "Courses" },
            { n: venues, label: l === "ar" ? "المواقع" : "Venues" },
            { n: categories, label: l === "ar" ? "الموضوعات" : "Subjects" },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border p-6 text-center">
              <div className="text-3xl font-bold text-brand">{s.n}</div>
              <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}