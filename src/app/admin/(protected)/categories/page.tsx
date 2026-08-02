import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CategoryForm } from "@/components/admin/category-form";
import { DeleteInList } from "@/components/admin/category-form";
import { deleteCategory } from "@/app/admin/(protected)/actions";

export default async function CategoriesPage() {
  const [categories, superCats] = await Promise.all([
    prisma.category.findMany({ orderBy: { nameEn: "asc" }, include: { superCategory: true } }),
    prisma.superCategory.findMany({ orderBy: { nameEn: "asc" } }),
  ]);

  return (
    <div>
      <PageHeader title="Categories" description="Course categories / training subjects." />
      <div className="mb-6">
        <Card>
          <CardContent className="pt-6">
            <h3 className="mb-4 font-semibold">Add Category</h3>
            <CategoryForm superCats={superCats} />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Super Category</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.nameEn}</TableCell>
                  <TableCell>{c.superCategory?.nameEn || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{c.slug}</TableCell>
                  <TableCell>{c.featured ? <Badge>Featured</Badge> : <Badge variant="outline">—</Badge>}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/admin/categories/${c.id}`} className="mr-2 text-sm text-brand hover:underline">
                      Edit
                    </Link>
                    <DeleteInList id={c.id} action={deleteCategory.bind(null, c.id)} label="Delete" />
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