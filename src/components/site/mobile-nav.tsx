"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Menu, X } from "lucide-react";

const items: Array<{ href: string; en: string; ar: string }> = [
  { href: "/new-training-courses", en: "New", ar: "الجديد" },
  { href: "/course-finder", en: "Course Finder", ar: "البحث عن دورة" },
  { href: "/training-subjects", en: "Courses", ar: "الدورات" },
  { href: "/training", en: "Venues", ar: "المواقع" },
  { href: "/certificates", en: "Certificates", ar: "الشهادات" },
  { href: "/training-calendar", en: "Calendar", ar: "التقويم" },
  { href: "/resources", en: "Resources", ar: "الموارد" },
  { href: "/about-us", en: "About Us", ar: "من نحن" },
  { href: "/contact-us", en: "Contact Us", ar: "اتصل بنا" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const locale = useLocale();
  const ar = locale === "ar";

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setOpen(true)}
        aria-label="Menu"
        className="flex h-10 w-10 items-center justify-center rounded-md border text-navy"
      >
        <Menu className="h-5 w-5" />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 right-0 flex w-72 max-w-[80%] flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <span className="text-lg font-extrabold text-brand">{ar ? "تكوين" : "Takween"}</span>
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
                  {ar ? it.ar : it.en}
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
                {ar ? "English" : "العربية"}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}