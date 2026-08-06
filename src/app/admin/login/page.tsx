import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { clearStaleSessionCookie } from "@/lib/auth-helpers";
import { LoginForm } from "@/components/admin/login-form";

export default async function LoginPage() {
  let session = null;
  try {
    session = await auth();
  } catch {
    await clearStaleSessionCookie();
  }
  if (session?.user) redirect("/admin");

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-navy via-brand-dark to-brand p-4">
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-brand-light/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-gold/10 blur-3xl" />
      <div className="relative w-full max-w-md">
        <LoginForm />
        <p className="mt-6 text-center text-xs text-white/60">
          Takween Training Institute — Authorized personnel only
        </p>
      </div>
    </div>
  );
}
