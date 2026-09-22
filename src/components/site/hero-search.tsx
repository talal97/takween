"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { Search } from "lucide-react";

export function HeroSearch() {
  const router = useRouter();
  const locale = useLocale();
  const [q, setQ] = useState("");
  const ar = locale === "ar";

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push(q.trim() ? `/course-finder?q=${encodeURIComponent(q.trim())}` : "/course-finder");
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto flex max-w-lg items-center gap-1 rounded-full border border-border bg-white py-1.5 pe-1.5 ps-5 shadow-lg shadow-black/10"
    >
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={ar ? "ابحث عن دورة تدريبية معينة" : "Search for a specific training course"}
        className="h-10 w-full min-w-0 border-0 bg-transparent text-sm text-navy outline-none placeholder:text-muted-foreground"
      />
      <button
        type="submit"
        aria-label={ar ? "بحث" : "Search"}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-white transition-colors hover:bg-brand-dark"
      >
        <Search className="h-4 w-4" />
      </button>
    </form>
  );
}
