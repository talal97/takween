"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Home, RefreshCw } from "lucide-react";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors");
  const nav = useTranslations("navigation");

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="text-4xl font-bold text-navy">{t("error.title")}</h1>
      <p className="mt-4 max-w-md text-sm text-gray-600">{t("error.message")}</p>
      <div className="mt-6 flex gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-md bg-brand px-6 py-3 text-white transition-colors hover:bg-brand/90"
        >
          <RefreshCw className="h-4 w-4" />
          {t("error.tryAgain")}
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-6 py-3 text-gray-700 transition-colors hover:bg-gray-100"
        >
          <Home className="h-4 w-4" />
          {nav("backToHome")}
        </Link>
      </div>
    </div>
  );
}
