import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";
import { DeleteInList } from "@/components/admin/category-form";
import { deleteTestimonial } from "../actions-content";
import { TestimonialForm } from "@/components/admin/testimonial-form";

export default async function TestimonialsPage() {
  const items = await prisma.testimonial.findMany({ orderBy: { sort: "asc" } });

  return (
    <div className="space-y-6">
      <PageHeader title="Testimonials" description="Client testimonials shown across the site." />

      <Card>
        <CardHeader><h3 className="font-semibold">Add Testimonial</h3></CardHeader>
        <CardContent><TestimonialForm /></CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Author</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Text</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No testimonials yet.</TableCell></TableRow>
              )}
              {items.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.author}</TableCell>
                  <TableCell>{t.company || "—"}</TableCell>
                  <TableCell className="max-w-md truncate text-muted-foreground">{t.textEn}</TableCell>
                  <TableCell>{t.featured ? "Yes" : "—"}</TableCell>
                  <TableCell className="flex justify-end gap-2 text-right">
                    <Link href={`/admin/testimonials/${t.id}`} className="text-sm text-muted-foreground hover:text-foreground">Edit</Link>
                    <DeleteInList id={t.id} action={deleteTestimonial.bind(null, t.id)} label="Delete" />
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