import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { clearStaleSessionCookie } from "@/lib/auth-helpers";
import { LoginForm } from "@/components/admin/login-form";
import { Link } from "@/i18n/navigation";

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
        <div className="mt-4 flex items-center justify-center gap-4">
          <Link
            href="/"
            className="text-sm text-white/70 transition-colors hover:text-white"
          >
            ← Back to Home
          </Link>
          <span className="text-white/30">|</span>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              locale="en"
              className="text-sm text-white/70 transition-colors hover:text-white"
            >
              English
            </Link>
            <span className="text-white/30">/</span>
            <Link
              href="/"
              locale="ar"
              className="text-sm text-white/70 transition-colors hover:text-white"
            >
              العربية
            </Link>
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-white/40">
          Takween Training Institute — Authorized personnel only
        </p>
      </div>
    </div>
  );
}
