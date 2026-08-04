import { Link } from "@/i18n/navigation";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="text-6xl font-bold text-navy">404</h1>
      <p className="mt-4 max-w-md text-lg text-gray-600">
        The page you are looking for doesn&apos;t exist or has moved.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 rounded-md bg-brand px-6 py-3 text-white transition-colors hover:bg-brand/90"
      >
        <Home className="h-4 w-4" />
        Back to Home
      </Link>
    </div>
  );
}
