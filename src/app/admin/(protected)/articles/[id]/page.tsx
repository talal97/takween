import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/admin/page-header";
import { ArticleForm } from "@/components/admin/article-form";

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const a = await prisma.article.findUnique({ where: { id } });
  if (!a) notFound();

  return (
    <div>
      <PageHeader title="Edit Article" description={a.titleEn || a.titleAr || a.slug} />
      <Card>
        <CardContent className="pt-6">
          <ArticleForm
            initial={{
              id: a.id,
              slug: a.slug,
              titleEn: a.titleEn,
              titleAr: a.titleAr ?? "",
              excerptEn: a.excerptEn ?? "",
              excerptAr: a.excerptAr ?? "",
              bodyEn: a.bodyEn ?? "",
              bodyAr: a.bodyAr ?? "",
              status: a.status,
              locale: a.locale,
              type: a.type,
              image: a.image ?? "",
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
