"use client";

import { serializeJsonLd } from "@/lib/safe-json";

import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { ChevronRight, ChevronLeft, Home } from "lucide-react";
import { Link } from "@/i18n/navigation";

const SEGMENT_MAP: Record<string, string> = {
  "training-subjects": "trainingSectors",
  "training-courses": "courses",
  "training-course": "course",
  "training-calendar": "calendar",
  "new-training-courses": "newCourses",
  "course-finder": "courseFinder",
  "certified-courses": "certifiedCourses",
  "about-us": "about",
  "contact-us": "contact",
  privacy: "privacy",
  terms: "terms",
};

export function Breadcrumb() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("breadcrumbs");
  const ar = locale === "ar";

  const segments = pathname.split("/").filter(Boolean);
  if (segments.length <= 1) return null;

  const items: Array<{ label: string; href: string }> = [
    { label: t("home"), href: "/" },
  ];

  let builtPath = "";
  for (let i = 1; i < segments.length; i++) {
    builtPath += `/${segments[i]}`;
    const key = SEGMENT_MAP[segments[i]];
    if (key) {
      items.push({ label: t(key), href: builtPath });
    } else if (segments[i - 1] === "training-course" || segments[i - 1] === "training-courses" || segments[i - 1] === "training-subjects" || segments[i - 1] === "certified-courses" || segments[i - 1] === "resources") {
      continue;
    } else {
      continue;
    }
  }

  if (items.length <= 1) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.label,
      item: `${typeof window !== "undefined" ? window.location.origin : ""}${item.href}`,
    })),
  };

  const Separator = ar ? ChevronLeft : ChevronRight;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
      <nav aria-label="Breadcrumb" className="mx-auto max-w-7xl px-4 pt-24 pb-2">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
          {items.map((item, idx) => (
            <li key={item.href} className="flex items-center gap-1.5">
              {idx > 0 && <Separator className="h-3.5 w-3.5 shrink-0" />}
              {idx === items.length - 1 ? (
                <span className="font-medium text-foreground">{item.label}</span>
              ) : (
                <Link href={item.href} className="hover:text-brand hover:underline">
                  {idx === 0 ? <Home className="h-3.5 w-3.5" /> : item.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
