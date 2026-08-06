import { PageHeader } from "@/components/admin/page-header";
import { ImportManager } from "@/components/admin/import-manager";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteItem } from "../actions-import";
import { BookOpen, FolderTree, Award, FileText, Trash2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ImportPage() {
  const [courses, categories, superCategories, certificates, articles] = await Promise.all([
    prisma.course.findMany({ select: { id: true, code: true, slug: true, titleEn: true }, orderBy: { createdAt: "desc" } }),
    prisma.category.findMany({ select: { id: true, slug: true, nameEn: true }, orderBy: { nameEn: "asc" } }),
    prisma.superCategory.findMany({ select: { id: true, slug: true, nameEn: true }, orderBy: { nameEn: "asc" } }),
    prisma.certificate.findMany({ select: { id: true, slug: true, nameEn: true, code: true }, orderBy: { nameEn: "asc" } }),
    prisma.article.findMany({ select: { id: true, slug: true, titleEn: true }, orderBy: { publishedAt: "desc" } }),
  ]);

  const sections: Array<{
    title: string;
    type: string;
    icon: typeof BookOpen;
    items: Array<{ id: string; name: string; slug: string }>;
  }> = [
    { title: "Courses", type: "course", icon: BookOpen, items: courses.map((c) => ({ id: c.id, name: `${c.code} — ${c.titleEn}`, slug: c.slug })) },
    { title: "Categories", type: "category", icon: FolderTree, items: categories.map((c) => ({ id: c.id, name: c.nameEn, slug: c.slug })) },
    { title: "Super Categories", type: "superCategory", icon: FolderTree, items: superCategories.map((c) => ({ id: c.id, name: c.nameEn, slug: c.slug })) },
    { title: "Certificates", type: "certificate", icon: Award, items: certificates.map((c) => ({ id: c.id, name: `${c.code} — ${c.nameEn}`, slug: c.slug })) },
    { title: "Articles", type: "article", icon: FileText, items: articles.map((a) => ({ id: a.id, name: a.titleEn, slug: a.slug })) },
  ];

  return (
    <div>
      <PageHeader title="Import from Live Site" description="Fetch content from wazzankw.com and manage your local database." />
      <ImportManager />

      <div className="mt-8 space-y-6">
        <h2 className="text-lg font-semibold text-navy">Current Content</h2>
        {sections.map((sec) => {
          const Icon = sec.icon;
          return (
            <Card key={sec.type}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon className="h-4 w-4 text-brand" />
                  {sec.title}
                  <Badge variant="secondary" className="ml-auto">{sec.items.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sec.items.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No items yet. Import from the live site above.</p>
                ) : (
                  <div className="space-y-1">
                    {sec.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-muted">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-navy">{item.name}</span>
                          <span className="text-xs text-muted-foreground">/{item.slug}</span>
                        </div>
                        <form action={async () => { "use server"; await deleteItem(sec.type, item.id); }}>
                          <Button type="submit" variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </form>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
