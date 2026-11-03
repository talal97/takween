import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";
import { DeleteInList } from "@/components/admin/category-form";
import { deleteArticle } from "../actions-content";
import { Badge } from "@/components/ui/badge";
import { ArticleForm } from "@/components/admin/article-form";

export default async function ArticlesPage() {
  const articles = await prisma.article.findMany({ orderBy: { publishedAt: "desc" } });

  return (
    <div className="space-y-6">
      <PageHeader title="Articles" description="Articles, press releases and case studies." />

      <Card>
        <CardHeader><h3 className="font-semibold">Add Article</h3></CardHeader>
        <CardContent><ArticleForm /></CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Website visibility</TableHead>
                <TableHead>Published</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No articles yet.</TableCell></TableRow>
              )}
              {articles.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.titleEn || a.titleAr || a.slug}</TableCell>
                  <TableCell><Badge variant="secondary">{a.type}</Badge></TableCell>
                  <TableCell>{a.status}</TableCell>
                  <TableCell>{a.locale === "en" ? "English only" : a.locale === "ar" ? "Arabic only" : "Both"}</TableCell>
                  <TableCell className="text-muted-foreground">{a.publishedAt.toLocaleDateString()}</TableCell>
                  <TableCell className="flex justify-end gap-2 text-right">
                    <Link href={`/admin/articles/${a.id}`} className="text-sm text-muted-foreground hover:text-foreground">Edit</Link>
                    <DeleteInList id={a.id} action={deleteArticle.bind(null, a.id)} label="Delete" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
