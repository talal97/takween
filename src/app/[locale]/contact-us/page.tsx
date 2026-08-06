import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { getSettingsCached } from "@/lib/settings";
import { ContactForm } from "@/components/site/contact-form";
import { PageHeader } from "@/components/site/page-header";
import { Breadcrumb } from "@/components/site/breadcrumb";
import { buildPageMetadata } from "@/lib/seo";
import { Phone, Mail, MapPin, Facebook, Instagram, Linkedin, Twitter, Youtube } from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const l = locale === "ar" ? "ar" : "en";
  const settings = await getSettingsCached();
  const title = settings[`contact_title_${l}`] || (l === "ar" ? "اتصل بنا" : "Contact Us");
  const description = settings[`contact_subtitle_${l}`] || (l === "ar" ? "يسعدنا سماع رأيك" : "Get in touch with Takween");
  return buildPageMetadata({ title, description, locale, path: "/contact-us" });
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l = (locale === "ar" ? "ar" : "en") as "en" | "ar";
  setRequestLocale(locale);
  const t = await getTranslations("common");
  const settings = await getSettingsCached();

  const title = settings[`contact_title_${l}`] || (l === "ar" ? "اتصل بنا" : "Contact Us");
  const subtitle = settings[`contact_subtitle_${l}`] || (
    l === "ar"
      ? "يسعدنا سماع رأيك. تواصل معنا وسنتولى الرد في أقرب وقت."
      : "We'd love to hear from you. Get in touch and we'll respond as soon as possible."
  );

  const phone = settings.contact_phone || "";
  const email = settings.contact_email || "";
  const address = settings[`contact_address_${l}`] || "";
  const socialLinks = [
    { key: "social_facebook", icon: Facebook, label: "Facebook" },
    { key: "social_instagram", icon: Instagram, label: "Instagram" },
    { key: "social_linkedin", icon: Linkedin, label: "LinkedIn" },
    { key: "social_twitter", icon: Twitter, label: "Twitter" },
    { key: "social_youtube", icon: Youtube, label: "YouTube" },
  ].filter((s) => settings[s.key]);

  return (
    <div>
      <Breadcrumb />
      <PageHeader title={title} subtitle={subtitle} />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <div className="rounded-lg border p-6">
              <ContactForm label={t("registerNow")} />
            </div>
          </div>
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-lg border p-6 space-y-5">
              <h2 className="text-lg font-semibold text-navy">
                {l === "ar" ? "معلومات التواصل" : "Contact Information"}
              </h2>
              {phone && (
                <a href={`tel:${phone}`} className="flex items-center gap-3 text-sm text-muted-foreground hover:text-brand">
                  <Phone className="h-4 w-4 shrink-0 text-brand" />
                  {phone}
                </a>
              )}
              {email && (
                <a href={`mailto:${email}`} className="flex items-center gap-3 text-sm text-muted-foreground hover:text-brand">
                  <Mail className="h-4 w-4 shrink-0 text-brand" />
                  {email}
                </a>
              )}
              {address && (
                <div className="flex items-start gap-3 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0 text-brand" />
                  <span>{address}</span>
                </div>
              )}
            </div>
            {socialLinks.length > 0 && (
              <div className="rounded-lg border p-6">
                <h2 className="mb-4 text-lg font-semibold text-navy">
                  {l === "ar" ? "تابعنا" : "Follow Us"}
                </h2>
                <div className="flex flex-wrap gap-3">
                  {socialLinks.map((s) => {
                    const Icon = s.icon;
                    return (
                      <a
                        key={s.key}
                        href={settings[s.key]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-10 w-10 items-center justify-center rounded-full border text-muted-foreground transition-colors hover:border-brand hover:text-brand"
                        aria-label={s.label}
                      >
                        <Icon className="h-4 w-4" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}