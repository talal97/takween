import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/require-admin";
import { PageHeader } from "@/components/admin/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import NextLink from "next/link";
import { UserForm, DeleteUserButton } from "@/components/admin/user-form";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const session = await requireOwner();
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
  const ownerCount = users.filter((u) => u.role === "owner").length;

  return (
    <div>
      <PageHeader title="Users" description="Manage admin accounts" />
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <h3 className="mb-4 font-semibold text-navy">Add User</h3>
            <UserForm />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => {
                  const isSelf = u.id === session.user.id;
                  const isLastOwner = u.role === "owner" && ownerCount <= 1;
                  return (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium text-navy">{u.name || "—"}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <Badge variant={u.role === "owner" ? "default" : "secondary"}>{u.role}</Badge>
                      </TableCell>
                      <TableCell>{u.createdAt.toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <NextLink
                            href={`/admin/users/${u.id}`}
                            className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                          >
                            Edit
                          </NextLink>
                          <DeleteUserButton id={u.id} disabled={isSelf || isLastOwner} />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
