import { setRequestLocale } from "next-intl/server";
import { getSettings } from "@/lib/settings";
import { PageHeader } from "@/components/site/page-header";
import { parsePageContent } from "@/lib/utils";

const FALLBACK_EN = `## Website Content

All content presented on this website is for informational purposes only, and course details, dates and fees may change without prior notice.

## Course Registration

Submitting a registration form is not a final confirmation of your seat. Our team will contact you to confirm registration and details.

## Contact Us

For any questions about these terms, please reach out via our contact page.`;

const FALLBACK_AR = `## محتوى الموقع

جميع المحتويات المعروضة على هذا الموقع هي لأغراض إعلامية فقط، وقد تتغير تفاصيل الدورات والمواعيد والأسعار دون إشعار مسبق.

## التسجيل في الدورات

إرسال نموذج التسجيل لا يعتبر تأكيداً نهائياً للمقعد في الدورة، وسيتواصل معك فريقنا لتأكيد التسجيل والتفاصيل.

## اتصل بنا

لأي استفسار حول هذه الشروط، يرجى التواصل معنا عبر صفحة اتصل بنا.`;

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l = (locale === "ar" ? "ar" : "en") as "en" | "ar";
  setRequestLocale(locale);

  const settings = await getSettings();
  const title = settings[`page_terms_title_${l}`] || (l === "ar" ? "شروط الاستخدام" : "Terms of Service");
  const subtitle = settings[`page_terms_subtitle_${l}`] || (l === "ar" ? "شروط استخدام موقع تكوين" : "Terms for using the Takween website");
  const raw = settings[`page_terms_${l}`] || (l === "ar" ? FALLBACK_AR : FALLBACK_EN);
  const blocks = parsePageContent(raw);

  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />
      <div className="mx-auto max-w-3xl px-4 py-10">
        {blocks.map((block, i) =>
          block.type === "heading" ? (
            <h2 key={i} className="mb-3 mt-8 text-xl font-semibold text-navy first:mt-0">{block.text}</h2>
          ) : (
            <p key={i} className="leading-relaxed text-muted-foreground">{block.text}</p>
          )
        )}
      </div>
    </div>
  );
}
