import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/admin/page-header";
import { TestimonialForm } from "@/components/admin/testimonial-form";

export default async function EditTestimonialPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [t, courses, categories] = await Promise.all([
    prisma.testimonial.findUnique({ where: { id } }),
    prisma.course.findMany({ select: { id: true, titleEn: true, titleAr: true }, orderBy: { titleEn: "asc" } }),
    prisma.category.findMany({ select: { id: true, nameEn: true }, orderBy: { nameEn: "asc" } }),
  ]);
  if (!t) notFound();

  return (
    <div>
      <PageHeader title="Edit Testimonial" description={t.author} />
      <Card>
        <CardContent className="pt-6">
          <TestimonialForm
            courses={courses}
            categories={categories}
            initial={{
              id: t.id,
              textEn: t.textEn,
              textAr: t.textAr ?? "",
              author: t.author,
              company: t.company ?? "",
              featured: t.featured,
              sort: t.sort,
              courseId: t.courseId ?? "",
              categoryId: t.categoryId ?? "",
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
