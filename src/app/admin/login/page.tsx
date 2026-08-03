import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "@/components/admin/login-form";

export default async function LoginPage() {
  let session = null;
  try {
    session = await auth();
  } catch {
    // JWTSessionError — stale or missing secret cookie. Treat as logged-out.
  }
  if (session?.user) redirect("/admin");

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="flex flex-col items-center gap-4">
        <span className="text-2xl font-bold text-brand">Takween</span>
        <LoginForm />
      </div>
    </div>
  );
}