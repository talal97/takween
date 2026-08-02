import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/admin/page-header";
import { TestimonialForm } from "@/components/admin/testimonial-form";

export default async function EditTestimonialPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await prisma.testimonial.findUnique({ where: { id } });
  if (!t) notFound();

  return (
    <div>
      <PageHeader title="Edit Testimonial" description={t.author} />
      <Card>
        <CardContent className="pt-6">
          <TestimonialForm
            initial={{
              id: t.id,
              textEn: t.textEn,
              textAr: t.textAr ?? "",
              author: t.author,
              company: t.company ?? "",
              featured: t.featured,
              sort: t.sort,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}