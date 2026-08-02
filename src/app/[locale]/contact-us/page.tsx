import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { ContactForm } from "@/components/site/contact-form";

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l = (locale === "ar" ? "ar" : "en") as "en" | "ar";
  setRequestLocale(locale);
  const t = await getTranslations("common");

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold text-navy">{l === "ar" ? "اتصل بنا" : "Contact Us"}</h1>
      <p className="mt-2 text-muted-foreground">
        {l === "ar"
          ? "يسعدنا سماع رأيك. تواصل معنا وسنتولى الرد في أقرب وقت."
          : "We'd love to hear from you. Get in touch and we'll respond as soon as possible."}
      </p>
      <div className="mt-6 rounded-lg border p-6">
        <ContactForm label={t("registerNow")} />
      </div>
    </div>
  );
}