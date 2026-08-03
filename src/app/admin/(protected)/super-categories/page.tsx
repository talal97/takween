import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { DeleteInList } from "@/components/admin/category-form";
import { deleteSuperCategory } from "../actions-taxonomy";
import { SuperCategoryForm } from "@/components/admin/super-category-form";

export default async function SuperCategoriesPage() {
  const items = await prisma.superCategory.findMany({ orderBy: { sort: "asc" }, include: { _count: { select: { categories: true } } } });

  return (
    <div className="space-y-6">
      <PageHeader title="Super Categories" description="Top-level training sectors that group categories." />

      <Card>
        <CardContent className="pt-6">
          <h3 className="mb-4 font-semibold">Add Super Category</h3>
          <SuperCategoryForm />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name (EN)</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Categories</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 && (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No super categories yet.</TableCell></TableRow>
              )}
              {items.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.nameEn}</TableCell>
                  <TableCell className="text-muted-foreground">{s.slug}</TableCell>
                  <TableCell>{s._count.categories}</TableCell>
                  <TableCell className="flex justify-end gap-2 text-right">
                    <Link href={`/admin/super-categories/${s.id}`} className="text-sm text-muted-foreground hover:text-foreground">Edit</Link>
                    <DeleteInList id={s.id} action={deleteSuperCategory.bind(null, s.id)} label="Delete" />
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