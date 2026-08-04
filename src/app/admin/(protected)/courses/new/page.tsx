import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CourseForm } from "@/components/admin/course-form";
import { PageHeader } from "@/components/admin/page-header";

export default async function NewCoursePage() {
  const [categories, venues, certificates, allCourses] = await Promise.all([
    prisma.category.findMany({ orderBy: { nameEn: "asc" } }),
    prisma.venue.findMany({ orderBy: { nameEn: "asc" } }),
    prisma.certificate.findMany({ orderBy: { nameEn: "asc" } }),
    prisma.course.findMany({ select: { id: true, titleEn: true, titleAr: true, code: true }, orderBy: { titleEn: "asc" } }),
  ]);

  return (
    <div>
      <PageHeader title="New Course" description="Create a new training course with content and schedules." />
      <Card>
        <CardHeader>
          <h3 className="font-semibold">Course Details</h3>
        </CardHeader>
        <CardContent>
          <CourseForm categories={categories} venues={venues} certificates={certificates} allCourses={allCourses} />
        </CardContent>
      </Card>
    </div>
  );
}