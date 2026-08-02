import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminSidebar } from "@/components/admin/sidebar";

export const metadata = { title: "Takween Admin" };

export default async function AdminGuardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  return (
    <div className="flex min-h-screen bg-muted/30">
      <AdminSidebar />
      <main className="flex-1 overflow-auto p-6 lg:p-8">{children}</main>
    </div>
  );
}