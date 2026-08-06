"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const STORAGE_KEY = "takween_cookie_consent";

export function CookieConsent() {
  const t = useTranslations("cookieConsent");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem(STORAGE_KEY);
    if (!accepted) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 border-t bg-white p-4 shadow-lg">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <p className="text-center text-sm text-muted-foreground sm:text-left">
          {t("message")}{" "}
          <Link href="/privacy" className="font-medium text-brand underline hover:text-brand-dark">
            {t("learnMore")}
          </Link>
        </p>
        <button
          onClick={accept}
          className="shrink-0 rounded-lg bg-navy px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-navy/90"
        >
          {t("accept")}
        </button>
      </div>
    </div>
  );
}
