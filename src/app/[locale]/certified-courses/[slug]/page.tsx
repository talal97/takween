import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { localeText } from "@/lib/data";
import { Link } from "@/i18n/navigation";
import { Card, CardContent } from "@/components/ui/card";

export default async function CertifiedCoursePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const l = (locale === "ar" ? "ar" : "en") as "en" | "ar";
  setRequestLocale(locale);

  const cert = await prisma.certificate.findUnique({ where: { slug }, include: { courses: true } });
  if (!cert) notFound();

  const courseIds = cert.courses.map((c) => c.id);
  const schedules = courseIds.length
    ? await prisma.schedule.findMany({
        where: { courseId: { in: courseIds } },
        include: { course: true, venue: true },
        orderBy: { startDate: "asc" },
      })
    : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold text-navy">{localeText({ en: cert.nameEn, ar: cert.nameAr }, l)}</h1>
      <p className="mt-2 text-muted-foreground">{cert.description}</p>
      <div className="mt-6 space-y-3">
        {schedules.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              {l === "ar" ? "لا توجد دورات مرتبطة بهذه الشهادة بعد." : "No courses linked to this certificate yet."}
            </CardContent>
          </Card>
        )}
        {schedules.map((s) => (
          <Card key={s.id}>
            <CardContent className="pt-6">
              <Link href={`/training-course/${s.course.slug}`} className="group font-semibold text-navy hover:text-brand">
                {localeText({ en: s.course.titleEn, ar: s.course.titleAr }, l)}
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}