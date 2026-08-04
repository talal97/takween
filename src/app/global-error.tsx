"use client";

import Link from "next/link";
import { Home } from "lucide-react";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center text-center">
          <h1 className="text-6xl font-bold text-navy">500</h1>
          <p className="mt-4 max-w-md text-lg text-gray-600">
            Internal Server Error
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Something went wrong. Please try again later.
          </p>
          <div className="mt-6 flex gap-3">
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-md bg-brand px-6 py-3 text-white transition-colors hover:bg-brand/90"
            >
              Reload
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-6 py-3 text-gray-700 transition-colors hover:bg-gray-100"
            >
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
