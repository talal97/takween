import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { getSettingsCached } from "@/lib/settings";
import { Facebook, Instagram, Linkedin, Twitter, Youtube } from "lucide-react";

export async function SiteFooter({ locale }: { locale: "en" | "ar" }) {
  const t = await getTranslations("navigation");
  const settings = await getSettingsCached();
  const phone = settings.contact_phone || "+971 (04) 425 0700";
  const email = settings.contact_email || "info@takween.com";
  const tagline = settings[`brand_tagline_${locale}`] || "";
  const socials: Array<{ key: string; icon: typeof Facebook }> = [
    { key: "social_facebook", icon: Facebook },
    { key: "social_instagram", icon: Instagram },
    { key: "social_linkedin", icon: Linkedin },
    { key: "social_twitter", icon: Twitter },
    { key: "social_youtube", icon: Youtube },
  ];
  return (
    <footer className="border-t bg-navy text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="text-xl font-extrabold text-white">
            {locale === "ar" ? "تكوين" : "Takween"}
          </div>
          <p className="mt-3 text-sm text-white/70">
            {tagline ||
              (locale === "ar" ? "دورات تدريبية احترافية للأفراد والمؤسسات حول العالم." : "Professional training courses for individuals and organisations worldwide.")}
          </p>
          {socials.filter((s) => settings[s.key]).length > 0 && (
            <div className="mt-4 flex gap-2">
              {socials.map((s) => {
                const url = settings[s.key];
                if (!url) return null;
                const Icon = s.icon;
                return (
                  <a key={s.key} href={url} target="_blank" rel="noreferrer" className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white/80 hover:bg-white/10">
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          )}
        </div>
        <div>
          <h4 className="mb-3 font-semibold">{t("courses")}</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li><Link href="/training-subjects">{t("viewAllCategories")}</Link></li>
            <li><Link href="/training">{t("viewAllVenues")}</Link></li>
            <li><Link href="/training-calendar">{t("calendar")}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-semibold">{t("about")}</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li><Link href="/about-us">{t("about")}</Link></li>
            <li><Link href="/contact-us">{t("contact")}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-semibold">{t("contact")}</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li><a href={`tel:${phone.replace(/[^+\d]/g, "")}`}>{phone}</a></li>
            <li><a href={`mailto:${email}`}>{email}</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        © {new Date().getFullYear()} {locale === "ar" ? "تكوين" : "Takween"} — {locale === "ar" ? "جميع الحقوق محفوظة" : "All rights reserved"}
      </div>
    </footer>
  );
}