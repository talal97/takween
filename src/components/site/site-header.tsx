import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { getNavigation } from "@/lib/data";
import { localeText } from "@/lib/data";
import { getSettings } from "@/lib/settings";
import { MobileNav } from "@/components/site/mobile-nav";

export async function SiteHeader({ locale }: { locale: "en" | "ar" }) {
  const t = await getTranslations("navigation");
  const nav = await getNavigation(locale);
  const settings = await getSettings();
  const phone = settings.contact_phone || "+971 (04) 425 0700";
  const email = settings.contact_email || "info@takween.com";

  return (
    <header className="border-b bg-white">
      <div className="border-b bg-navy text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 text-xs">
          <div className="flex items-center gap-4">
            <a href={`tel:${phone.replace(/[^+\d]/g, "")}`} className="opacity-90 hover:opacity-100">{phone}</a>
            <a href={`mailto:${email}`} className="hidden opacity-90 hover:opacity-100 sm:inline">{email}</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin" className="opacity-90 hover:opacity-100">Admin</Link>
            {locale === "ar" ? (
              <Link href="/" locale="en" className="font-semibold text-gold hover:underline">English</Link>
            ) : (
              <Link href="/" locale="ar" className="font-semibold text-gold hover:underline">{t("arabic")}</Link>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-2xl font-extrabold tracking-tight text-brand">
          {locale === "ar" ? "تكوين" : "Takween"}
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium lg:flex">
          <Link href="/new-training-courses" className="text-muted-foreground hover:text-brand">{t("new")}</Link>
          <Link href="/course-finder" className="text-muted-foreground hover:text-brand">{t("courseFinder")}</Link>
          <Link href="/training-subjects" className="text-muted-foreground hover:text-brand">{t("courses")}</Link>
          <Link href="/training" className="text-muted-foreground hover:text-brand">{t("trainingVenues")}</Link>
          <Link href="/certificates" className="text-muted-foreground hover:text-brand">{t("certificates")}</Link>
          <Link href="/training-subjects/sector-specific-training-courses" className="text-muted-foreground hover:text-brand">{t("trainingSectors")}</Link>
          <Link href="/contact-us" className="text-muted-foreground hover:text-brand">{t("contact")}</Link>
        </nav>
        <div className="lg:hidden">
          <MobileNav />
        </div>
      </div>
    </header>
  );
}