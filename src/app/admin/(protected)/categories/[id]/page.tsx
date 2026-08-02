import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/admin/page-header";
import { CategoryForm } from "@/components/admin/category-form";

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [category, superCats] = await Promise.all([
    prisma.category.findUnique({ where: { id } }),
    prisma.superCategory.findMany({ orderBy: { nameEn: "asc" } }),
  ]);
  if (!category) notFound();

  return (
    <div>
      <PageHeader title="Edit Category" description={category.nameEn} />
      <Card>
        <CardContent className="pt-6">
          <CategoryForm
            superCats={superCats}
            initial={{
              id: category.id,
              slug: category.slug,
              nameEn: category.nameEn,
              nameAr: category.nameAr ?? "",
              taglineEn: category.taglineEn ?? "",
              descriptionEn: category.descriptionEn ?? "",
              superCategoryId: category.superCategoryId ?? "",
              featured: category.featured,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}