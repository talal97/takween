import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { clearStaleSessionCookie } from "@/lib/auth-helpers";
import { AdminSidebar } from "@/components/admin/sidebar";

export const metadata = { title: "Takween Admin" };

export default async function AdminGuardLayout({ children }: { children: React.ReactNode }) {
  let session = null;
  try {
    session = await auth();
  } catch {
    await clearStaleSessionCookie();
  }
  if (!session?.user) redirect("/admin/login");

  return (
    <div className="flex min-h-screen bg-slate-50/70">
      <AdminSidebar />
      <main className="flex-1 overflow-auto p-4 pt-20 lg:p-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}