"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Menu, X } from "lucide-react";

const items = [
  { href: "/new-training-courses", key: "new" },
  { href: "/course-finder", key: "courseFinder" },
  { href: "/training-subjects", key: "courses" },
  { href: "/training", key: "trainingVenues" },
  { href: "/certificates", key: "certificates" },
  { href: "/countries", key: "countries" },
  { href: "/training-calendar", key: "calendar" },
  { href: "/resources", key: "resources" },
  { href: "/about-us", key: "about" },
  { href: "/contact-us", key: "contact" },
];

export function MobileNav({ brandName = "Takween", brandNameAr = "تكوين" }: { brandName?: string; brandNameAr?: string }) {
  const [open, setOpen] = useState(false);
  const locale = useLocale();
  const t = useTranslations("navigation");
  const ar = locale === "ar";

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setOpen(true)}
        aria-label="Menu"
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-md border border-white/25 text-white"
      >
        <Menu className="h-5 w-5" />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 end-0 flex w-72 max-w-[80%] flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <span className="text-lg font-extrabold text-brand">{ar ? brandNameAr : brandName}</span>
              <button onClick={() => setOpen(false)} aria-label="Close" className="flex h-9 w-9 items-center justify-center rounded border">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto p-4">
              {items.map((it) => (
                <Link
                  key={it.href}
                  href={it.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-2.5 text-sm font-medium text-navy hover:bg-muted hover:text-brand"
                >
                  {t(it.key)}
                </Link>
              ))}
            </nav>
            <div className="border-t p-4">
              <Link
                href="/"
                locale={ar ? "en" : "ar"}
                onClick={() => setOpen(false)}
                className="text-sm font-semibold text-brand hover:underline"
              >
                {t(ar ? "english" : "arabic")}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}