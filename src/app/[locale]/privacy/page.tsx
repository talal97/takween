import { setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/site/page-header";

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l = (locale === "ar" ? "ar" : "en") as "en" | "ar";
  setRequestLocale(locale);

  return (
    <div>
      <PageHeader
        title={l === "ar" ? "سياسة الخصوصية" : "Privacy Policy"}
        subtitle={l === "ar" ? "كيف نتعامل مع بياناتك" : "How we handle your data"}
      />
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h2 className="mb-3 text-xl font-semibold text-navy">
          {l === "ar" ? "جمع البيانات واستخدامها" : "Data Collection and Use"}
        </h2>
        <p className="leading-relaxed text-muted-foreground">
          {l === "ar"
            ? "نجمع البيانات التي تقدمها لنا طوعاً من خلال نماذج التسجيل والتواصل، ونستخدمها حصرياً للرد على استفساراتك وتقديم خدماتنا التدريبية."
            : "We collect information you voluntarily provide through our registration and contact forms, and use it solely to respond to your enquiries and deliver our training services."}
        </p>
        <h2 className="mb-3 mt-8 text-xl font-semibold text-navy">
          {l === "ar" ? "حماية البيانات" : "Data Protection"}
        </h2>
        <p className="leading-relaxed text-muted-foreground">
          {l === "ar"
            ? "نطبق إجراءات أمنية مناسبة لحماية بياناتك من الوصول غير المصرح به أو الإفصاح أو التعديل."
            : "We apply appropriate security measures to protect your data against unauthorised access, disclosure or alteration."}
        </p>
        <h2 className="mb-3 mt-8 text-xl font-semibold text-navy">
          {l === "ar" ? "اتصل بنا" : "Contact Us"}
        </h2>
        <p className="leading-relaxed text-muted-foreground">
          {l === "ar"
            ? "لأي استفسار حول سياسة الخصوصية، يرجى التواصل معنا عبر صفحة اتصل بنا."
            : "For any privacy policy questions, please reach out via our contact page."}
        </p>
      </div>
    </div>
  );
}
