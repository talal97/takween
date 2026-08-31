import { Link } from "@/i18n/navigation";
import { localeText } from "@/lib/data";
import { Locale } from "@/i18n/config";
import { MapPin } from "lucide-react";

type Country = {
  iso: string;
  nameEn: string;
  nameAr: string | null;
  flag: string | null;
  venueCount: number;
};

function FlagImage({ iso, name, flagUrl }: { iso: string; name: string; flagUrl?: string | null }) {
  const src = flagUrl || `https://flagcdn.com/w80/${iso.toLowerCase()}.png`;
  return (
    <img
      src={src}
      alt={`${name} flag`}
      className="h-6 w-8 rounded object-cover shadow-sm"
      loading="lazy"
      onError={(e) => {
        e.currentTarget.src = `https://flagcdn.com/w80/${iso.toLowerCase()}.png`;
      }}
    />
  );
}

export function CountriesGrid({ countries, locale, compact = false }: { countries: Country[]; locale: Locale; compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex flex-wrap justify-center gap-4">
        {countries.map((c) => (
          <Link
            key={c.iso}
            href="/countries"
            className="group flex items-center gap-3 rounded-xl border bg-white px-5 py-3 transition-all hover:-translate-y-0.5 hover:border-brand hover:shadow-md"
          >
            <FlagImage iso={c.iso} name={c.nameEn} flagUrl={c.flag} />
            <span className="text-sm font-medium text-navy group-hover:text-brand">{localeText({ en: c.nameEn, ar: c.nameAr }, locale)}</span>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {countries.map((c) => (
        <Link
          key={c.iso}
          href="/training"
          className="group relative overflow-hidden rounded-xl border bg-white p-6 text-center transition-all hover:-translate-y-1 hover:border-brand hover:shadow-lg"
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-brand opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="flex justify-center">
            <FlagImage iso={c.iso} name={c.nameEn} flagUrl={c.flag} />
          </div>
          <h3 className="mt-3 text-sm font-semibold text-navy group-hover:text-brand">
            {localeText({ en: c.nameEn, ar: c.nameAr }, locale)}
          </h3>
          {c.venueCount > 0 && (
            <p className="mt-1 flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <MapPin size={12} className="shrink-0" />
              {c.venueCount} {locale === "ar" ? "أماكن" : "venues"}
            </p>
          )}
        </Link>
      ))}
    </div>
  );
}
