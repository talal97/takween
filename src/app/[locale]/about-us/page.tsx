import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { PageHeader } from "@/components/site/page-header";
import { parsePageContent } from "@/lib/utils";
import { Breadcrumb } from "@/components/site/breadcrumb";
import { buildPageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const l = locale === "ar" ? "ar" : "en";
  const settings = await getSettings();
  const title = settings[`about_title_${l}`] || (l === "ar" ? "من نحن" : "About Us");
  const description = settings[`about_subtitle_${l}`] || (l === "ar" ? "تعرف على تكوين ورؤيتها" : "Learn more about Takween and our vision");
  return buildPageMetadata({ title, description, locale, path: "/about-us" });
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l = (locale === "ar" ? "ar" : "en") as "en" | "ar";
  setRequestLocale(locale);
  const settings = await getSettings();

  const title = settings[`about_title_${l}`] || (l === "ar" ? "من نحن" : "About Us");
  const subtitle = settings[`about_subtitle_${l}`] || (l === "ar" ? "تعرف على تكوين ورؤيتها" : "Learn more about Takween and our vision");
  const bodyRaw = settings[`page_about_${l}`] || "";
  const body = parsePageContent(bodyRaw);

  const [venues, categories, courses] = await Promise.all([
    prisma.venue.count(),
    prisma.category.count(),
    prisma.course.count(),
  ]);

  return (
    <div>
      <Breadcrumb />
      <PageHeader title={title} subtitle={subtitle} />
      <div className="mx-auto max-w-4xl px-4 py-10">
        {body.length > 0 ? (
          <div className="space-y-6">
            {body.map((block, i) =>
              block.type === "heading" ? (
                <h2 key={i} className="text-xl font-semibold text-navy">{block.text}</h2>
              ) : (
                <p key={i} className="leading-relaxed text-muted-foreground">{block.text}</p>
              )
            )}
          </div>
        ) : (
          <p className="text-lg leading-relaxed text-muted-foreground">
            {l === "ar"
              ? "نحن شركة عالمية رائدة في التدريب المهني، نقدّم أكثر من 1000 دورة في مدن حول العالم، معتمدين على مدربين خبراء ومناهج عملية تدريب."
              : "We are a leading professional training provider, delivering over 1000 courses across cities worldwide, powered by expert trainers and hands-on, practical curricula."}
          </p>
        )}
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
