import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { getSettingsCached } from "@/lib/settings";
import { MobileNav } from "@/components/site/mobile-nav";
import { MegaMenu } from "@/components/site/mega-menu";
import { Phone, Mail } from "lucide-react";

export async function SiteHeader({ locale }: { locale: "en" | "ar" }) {
  const t = await getTranslations("navigation");
  const settings = await getSettingsCached();
  const phone = settings.contact_phone || "+971 (04) 425 0700";
  const email = settings.contact_email || "info@takween.com";
  const brandName = settings.brand_name || "Takween";

  return (
    <header className="absolute inset-x-0 top-0 z-50">
      {/* Top utility bar — semi-transparent */}
      <div className="border-b border-white/10 bg-black/20 text-white/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5 text-xs">
          <div className="flex items-center gap-5">
            <a href={`tel:${phone.replace(/[^+\d]/g, "")}`} data-track="header-phone" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Phone className="h-3 w-3" />
              {phone}
            </a>
            <a href={`mailto:${email}`} data-track="header-email" className="hidden items-center gap-1.5 hover:text-white transition-colors sm:flex">
              <Mail className="h-3 w-3" />
              {email}
            </a>
          </div>
          <div className="flex items-center gap-3">
            {locale === "ar" ? (
              <Link href="/" locale="en" className="font-semibold text-gold hover:underline">English</Link>
            ) : (
              <Link href="/" locale="ar" className="font-semibold text-gold hover:underline">{t("arabic")}</Link>
            )}
          </div>
        </div>
      </div>

      {/* Main navigation — transparent, on hero */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4">
        <Link href="/" className="py-5 text-2xl font-extrabold tracking-tight text-white">
          {locale === "ar" ? "تكوين" : brandName}
        </Link>

        <nav className="hidden items-center lg:flex">
          <Link
            href="/new-training-courses"
            className="px-3 py-5 text-sm font-medium text-white/90 transition-colors hover:text-gold"
          >
            <span className="rounded bg-brand px-2 py-0.5 text-xs font-bold uppercase text-white">
              {locale === "ar" ? "جديد" : "New"}
            </span>
          </Link>
          <Link
            href="/course-finder"
            data-track="nav-course-finder"
            className="px-3 py-5 text-sm font-medium text-white/90 transition-colors hover:text-gold uppercase"
          >
            {t("courseFinder")}
          </Link>

          <MegaMenu locale={locale} />

          <Link
            href="/training"
            className="px-3 py-5 text-sm font-medium text-white/90 transition-colors hover:text-gold uppercase"
          >
            {t("trainingVenues")}
          </Link>
          <Link
            href="/certificates"
            className="px-3 py-5 text-sm font-medium text-white/90 transition-colors hover:text-gold uppercase"
          >
            {t("certificates")}
          </Link>
          <Link
            href="/countries"
            className="px-3 py-5 text-sm font-medium text-white/90 transition-colors hover:text-gold uppercase"
          >
            {t("countries")}
          </Link>
          <Link
            href="/contact-us"
            data-track="nav-contact"
            className="px-3 py-5 text-sm font-medium text-white/90 transition-colors hover:text-gold uppercase"
          >
            {t("contact")}
          </Link>
        </nav>

        <div className="lg:hidden">
          <MobileNav brandName={brandName} />
        </div>
      </div>
    </header>
  );
}
