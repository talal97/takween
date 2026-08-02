import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/admin/page-header";
import { SuperCategoryForm } from "@/components/admin/super-category-form";

export default async function EditSuperCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await prisma.superCategory.findUnique({ where: { id } });
  if (!s) notFound();

  return (
    <div>
      <PageHeader title="Edit Super Category" description={s.nameEn} />
      <Card>
        <CardContent className="pt-6">
          <SuperCategoryForm
            initial={{
              id: s.id,
              slug: s.slug,
              nameEn: s.nameEn,
              nameAr: s.nameAr ?? "",
              image: s.image ?? "",
              sort: s.sort,
              featured: s.featured,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}