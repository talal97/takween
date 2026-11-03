import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CourseForm } from "@/components/admin/course-form";
import { PageHeader } from "@/components/admin/page-header";

export default async function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [course, categories, venues, certificates, allCourses] = await Promise.all([
    prisma.course.findUnique({
      where: { id },
      include: {
        schedules: { include: { venue: true } },
        certificates: true,
        relatedAsSource: true,
      },
    }),
    prisma.category.findMany({ orderBy: { nameEn: "asc" } }),
    prisma.venue.findMany({ orderBy: { nameEn: "asc" } }),
    prisma.certificate.findMany({ orderBy: { nameEn: "asc" } }),
    prisma.course.findMany({ where: { id: { not: id } }, select: { id: true, titleEn: true, titleAr: true, code: true }, orderBy: { titleEn: "asc" } }),
  ]);

  if (!course) notFound();

  const initial = {
    code: course.code,
    slug: course.slug,
    locale: course.locale,
    image: course.image ?? "",
    titleEn: course.titleEn,
    titleAr: course.titleAr ?? "",
    subtitleEn: course.subtitleEn ?? "",
    subtitleAr: course.subtitleAr ?? "",
    badgeEn: course.badgeEn ?? "",
    badgeAr: course.badgeAr ?? "",
    durationDays: String(course.durationDays),
    categoryId: course.categoryId,
    featured: course.featured,
    introEn: course.introEn ?? "",
    introAr: course.introAr ?? "",
    objectivesEn: course.objectivesEn ?? "",
    objectivesAr: course.objectivesAr ?? "",
    methodologyEn: course.methodologyEn ?? "",
    methodologyAr: course.methodologyAr ?? "",
    orgImpactEn: course.orgImpactEn ?? "",
    orgImpactAr: course.orgImpactAr ?? "",
    personalImpactEn: course.personalImpactEn ?? "",
    personalImpactAr: course.personalImpactAr ?? "",
    targetAudienceEn: course.targetAudienceEn ?? "",
    targetAudienceAr: course.targetAudienceAr ?? "",
    certificateNoteEn: course.certificateNoteEn ?? "",
    certificateNoteAr: course.certificateNoteAr ?? "",
    seoTitleEn: course.seoTitleEn ?? "",
    seoTitleAr: course.seoTitleAr ?? "",
  };

  const existingDays = (course.dayOutlineEn as Array<{ day: number; title: string; topics: string[] }> | null) ?? undefined;
  const existingSchedules = course.schedules.map((s) => ({
    active: s.active,
    venueId: s.venueId,
    startDate: s.startDate,
    endDate: s.endDate,
    fee: s.fee.toNumber(),
    currency: s.currency,
    format: s.format,
  }));
  const existingCertIds = course.certificates.map((c) => c.id);
  const existingRelatedIds = course.relatedAsSource.map((r) => r.relatedId);

  return (
    <div>
      <PageHeader title="Edit Course" description={course.titleEn || course.titleAr || course.slug} />
      <Card>
        <CardHeader>
          <h3 className="font-semibold">Course Details</h3>
        </CardHeader>
        <CardContent>
          <CourseForm
            categories={categories}
            venues={venues}
            certificates={certificates}
            allCourses={allCourses}
            id={course.id}
            initial={initial}
            existingDays={existingDays}
            existingDaysAr={((course.dayOutlineAr ?? (course.locale === "ar" ? course.dayOutlineEn : null)) as Array<{ day: number; title: string; topics: string[] }> | null) ?? undefined}
            existingSchedules={existingSchedules}
            existingCertIds={existingCertIds}
            existingRelatedIds={existingRelatedIds}
          />
        </CardContent>
      </Card>
    </div>
  );
}