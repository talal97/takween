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
import NextLink from "next/link";
import { StatusButton } from "@/components/admin/status-button";
import { DeleteInList } from "@/components/admin/category-form";
import { deleteRegistration } from "../actions-settings";
import { Pagination } from "@/components/admin/pagination";

const PAGE_SIZE = 25;

export default async function SubmissionsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);

  const [submissions, total] = await prisma.$transaction([
    prisma.registration.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.registration.count(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <PageHeader title="Registrations & Enquiries" description="Interest submissions from the registration forms (no accounts or payments)." />
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">No submissions yet.</TableCell></TableRow>
              )}
              {submissions.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="text-muted-foreground">{r.createdAt.toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">{r.fullName}</TableCell>
                  <TableCell>{r.email}</TableCell>
                  <TableCell className="max-w-xs truncate">{r.courseTitle}</TableCell>
                  <TableCell>{r.countryIso || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={r.status === "new" ? "default" : "secondary"}>{r.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <NextLink
                      href={`/admin/submissions/${r.id}`}
                      className="mr-2 inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted"
                    >
                      View
                    </NextLink>
                    <StatusButton id={r.id} status={r.status} />
                    <DeleteInList id={r.id} action={deleteRegistration.bind(null, r.id)} label="Delete" />
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