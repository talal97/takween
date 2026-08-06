import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { clearStaleSessionCookie } from "@/lib/auth-helpers";

export async function requireAdmin() {
  let session = null;
  try {
    session = await auth();
  } catch {
    await clearStaleSessionCookie();
  }
  if (!session?.user) redirect("/admin/login");
  return session;
}

export async function requireOwner() {
  const session = await requireAdmin();
  if (session.user.role !== "owner") redirect("/admin");
  return session;
}