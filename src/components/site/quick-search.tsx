"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";

type Option = { key: string; slug: string; labelEn: string; labelAr?: string | null };

export function QuickSearch({ categories, venues }: { categories: Option[]; venues: Option[] }) {
  const router = useRouter();
  const locale = useLocale();
  const [cat, setCat] = useState("");
  const [venue, setVenue] = useState("");

  const ar = locale === "ar";

  function go() {
    if (cat) router.push(`/training-courses/${cat}`);
    else if (venue) router.push(`/training/${venue}`);
  }

  function label(o: Option) {
    return ar && o.labelAr ? o.labelAr : o.labelEn;
  }

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-muted-foreground">
            {ar ? "اختر التخصص" : "Select your Category"}
          </label>
          <select
            value={cat}
            onChange={(e) => {
              setCat(e.target.value);
              if (e.target.value) setVenue("");
            }}
            className="mt-1 h-12 w-full rounded-lg border border-input bg-white px-3 text-sm outline-none focus:border-brand"
          >
            <option value="">{ar ? "التخصصات" : "All subjects"}</option>
            {categories.map((o) => (
              <option key={o.key} value={o.slug}>
                {label(o)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground">
            {ar ? "اختر الموقع" : "Select your Venue"}
          </label>
          <select
            value={venue}
            onChange={(e) => {
              setVenue(e.target.value);
              if (e.target.value) setCat("");
            }}
            className="mt-1 h-12 w-full rounded-lg border border-input bg-white px-3 text-sm outline-none focus:border-brand"
          >
            <option value="">{ar ? "المواقع" : "All venues"}</option>
            {venues.map((o) => (
              <option key={o.key} value={o.slug}>
                {o.labelEn}
              </option>
            ))}
          </select>
        </div>
      </div>
      <button
        onClick={go}
        className="mt-4 flex h-12 w-full items-center justify-center rounded-lg bg-brand text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
      >
        {ar ? "ابحث عن دورة" : "Search for courses"}
      </button>
    </div>
  );
}