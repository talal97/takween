import { notFound } from "next/navigation";
import { getLocale, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import LocaleNotFound from "@/app/app/not-found";

export default async function LocaleNotFoundPage() {
  // not-found.tsx is a route boundary and does NOT receive route params in the
  // App Router. Resolve the locale from the request context instead.
  const locale = await getLocale();
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }
  setRequestLocale(locale);
  return <LocaleNotFound />;
}
