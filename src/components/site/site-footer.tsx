import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { getSettingsCached } from "@/lib/settings";
import { Facebook, Instagram, Linkedin, Twitter, Youtube, Phone, Mail, MapPin } from "lucide-react";

export async function SiteFooter({ locale }: { locale: "en" | "ar" }) {
  const t = await getTranslations("navigation");
  const settings = await getSettingsCached();
  const phone = settings.contact_phone || "+971 (04) 425 0700";
  const email = settings.contact_email || "info@takween.com";
  const address = settings.contact_address || "";
  const tagline = settings[`brand_tagline_${locale}`] || "";
  const socials: Array<{ key: string; icon: typeof Facebook }> = [
    { key: "social_facebook", icon: Facebook },
    { key: "social_instagram", icon: Instagram },
    { key: "social_linkedin", icon: Linkedin },
    { key: "social_twitter", icon: Twitter },
    { key: "social_youtube", icon: Youtube },
  ];

  return (
    <footer className="bg-navy text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand + socials */}
        <div>
          <div className="text-2xl font-extrabold text-white">
            {locale === "ar" ? "تكوين" : "Takween"}
          </div>
          <p className="mt-3 text-sm leading-relaxed text-white/60">
            {tagline ||
              (locale === "ar"
                ? "دورات تدريبية احترافية للأفراد والمؤسسات حول العالم."
                : "Professional training courses for individuals and organisations worldwide.")}
          </p>
          {socials.filter((s) => settings[s.key]).length > 0 && (
            <div className="mt-5 flex gap-2">
              {socials.map((s) => {
                const url = settings[s.key];
                if (!url) return null;
                const Icon = s.icon;
                return (
                  <a
                    key={s.key}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/60 transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick links */}
        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/90">
            {locale === "ar" ? "روابط سريعة" : "Quick Links"}
          </h4>
          <ul className="space-y-2.5 text-sm text-white/60">
            <li><Link href="/training-subjects" className="transition-colors hover:text-white">{t("courses")}</Link></li>
            <li><Link href="/training" className="transition-colors hover:text-white">{t("trainingVenues")}</Link></li>
            <li><Link href="/training-calendar" className="transition-colors hover:text-white">{t("calendar")}</Link></li>
            <li><Link href="/certificates" className="transition-colors hover:text-white">{t("certificates")}</Link></li>
            <li><Link href="/new-training-courses" className="transition-colors hover:text-white">{t("new")}</Link></li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/90">
            {locale === "ar" ? "الشركة" : "Company"}
          </h4>
          <ul className="space-y-2.5 text-sm text-white/60">
            <li><Link href="/about-us" className="transition-colors hover:text-white">{t("about")}</Link></li>
            <li><Link href="/resources" className="transition-colors hover:text-white">{locale === "ar" ? "الموارد" : "Resources"}</Link></li>
            <li><Link href="/contact-us" className="transition-colors hover:text-white">{t("contact")}</Link></li>
            <li><Link href="/contact-us#careers" className="transition-colors hover:text-white">{locale === "ar" ? "الوظائف" : "Careers"}</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/90">
            {locale === "ar" ? "اتصل بنا" : "Contact Us"}
          </h4>
          <ul className="space-y-3 text-sm text-white/60">
            <li className="flex items-start gap-2">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-white/40" />
              <a href={`tel:${phone.replace(/[^+\d]/g, "")}`} className="transition-colors hover:text-white">{phone}</a>
            </li>
            <li className="flex items-start gap-2">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-white/40" />
              <a href={`mailto:${email}`} className="transition-colors hover:text-white">{email}</a>
            </li>
            {address && (
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-white/40" />
                <span>{address}</span>
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-white/40 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {locale === "ar" ? "تكوين" : "Takween"} — {locale === "ar" ? "جميع الحقوق محفوظة" : "All rights reserved"}
          </p>
          <div className="flex gap-4">
            <Link href="/privacy" className="transition-colors hover:text-white/70">{locale === "ar" ? "الخصوصية" : "Privacy Policy"}</Link>
            <Link href="/terms" className="transition-colors hover:text-white/70">{locale === "ar" ? "الشروط" : "Terms of Service"}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
