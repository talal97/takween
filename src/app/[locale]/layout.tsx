import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { LocaleDir } from "@/components/site/locale-dir";
import { organizationJsonLd } from "@/lib/seo";
import { Tracker } from "@/components/analytics/tracker";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) notFound();
  setRequestLocale(locale);

  const messages = await getMessages();
  const orgJson = await organizationJsonLd();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJson) }} />
      <LocaleDir />
      <NextIntlClientProvider messages={messages}>
        <div className="flex min-h-screen flex-col">
          {process.env.NODE_ENV === "production" && <Tracker />}
          <SiteHeader locale={locale as "en" | "ar"} />
          <main className="flex-1">{children}</main>
          <SiteFooter locale={locale as "en" | "ar"} />
        </div>
      </NextIntlClientProvider>
    </>
  );
}