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
import { DeleteCourseButton } from "@/components/admin/delete-course-button";
import { Pagination } from "@/components/admin/pagination";

const PAGE_SIZE = 25;

export default async function CoursesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);

  const [courses, total] = await prisma.$transaction([
    prisma.course.findMany({
      orderBy: { updatedAt: "desc" },
      include: { category: true, schedules: true },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.course.count(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <PageHeader
        title="Courses"
        description="Manage training courses, schedules and content."
        actionLabel="New Course"
        actionHref="/admin/courses/new"
      />
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Sessions</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No courses yet. Create your first course.
                  </TableCell>
                </TableRow>
              )}
              {courses.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="font-medium">{c.titleEn}</div>
                    <div className="text-xs text-muted-foreground">/training-course/{c.slug}</div>
                  </TableCell>
                  <TableCell>{c.category?.nameEn}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{c.schedules.length} session(s)</Badge>
                  </TableCell>
                  <TableCell>{c.featured ? <Badge>Featured</Badge> : <Badge variant="outline">—</Badge>}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/admin/courses/${c.id}`} className="text-sm text-brand hover:underline">
                      Edit
                    </Link>
                    <DeleteCourseButton id={c.id} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Pagination page={page} totalPages={totalPages} pageSize={PAGE_SIZE} total={total} />
    </div>
  );
}