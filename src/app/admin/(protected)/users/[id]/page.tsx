import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/require-admin";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { UserForm, ChangePasswordForm } from "@/components/admin/user-form";

export const dynamic = "force-dynamic";

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  await requireOwner();
  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) notFound();

  return (
    <div>
      <PageHeader title="Edit User" description={user.name || user.email} />
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <UserForm initial={{ id: user.id, name: user.name, email: user.email, role: user.role }} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="mb-4 font-semibold text-navy">Change Password</h3>
            <ChangePasswordForm userId={user.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
