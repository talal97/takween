
import { serializeJsonLd } from "@/lib/safe-json";
import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { WhatsAppButton } from "@/components/site/whatsapp-button";
import { BackToTop } from "@/components/site/back-to-top";
import { CookieConsent } from "@/components/site/cookie-consent";
import { LocaleDir } from "@/components/site/locale-dir";
import { organizationJsonLd } from "@/lib/seo";
import { Tracker } from "@/components/analytics/tracker";
import { getSettingsCached } from "@/lib/settings";

// This layout (and every page under it) reads from the database on every
// request (settings, nav, content), so none of it can be statically
// prerendered at Docker build time — no DB is reachable there.
export const dynamic = "force-dynamic";

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
  const settings = await getSettingsCached();
  const whatsappPhone = settings.whatsapp_phone || settings.contact_whatsapp || "";

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(orgJson) }} />
          <LocaleDir locale={locale as "en" | "ar"} />
      <NextIntlClientProvider messages={messages}>
        <div className="flex min-h-screen flex-col">
          {process.env.NODE_ENV === "production" && <Tracker />}
          <SiteHeader locale={locale as "en" | "ar"} />
          <main className="flex-1">{children}</main>
          <SiteFooter locale={locale as "en" | "ar"} />
        </div>
      <WhatsAppButton phone={whatsappPhone} />
      <BackToTop />
      <CookieConsent />
      </NextIntlClientProvider>
    </>
  );
}