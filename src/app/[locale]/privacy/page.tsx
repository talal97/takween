import { setRequestLocale } from "next-intl/server";
import { getSettings } from "@/lib/settings";
import { PageHeader } from "@/components/site/page-header";
import { parsePageContent } from "@/lib/utils";

const FALLBACK_EN = `## Data Collection and Use

We collect information you voluntarily provide through our registration and contact forms, and use it solely to respond to your enquiries and deliver our training services.

## Data Protection

We apply appropriate security measures to protect your data against unauthorised access, disclosure or alteration.

## Contact Us

For any privacy policy questions, please reach out via our contact page.`;

const FALLBACK_AR = `## جمع البيانات واستخدامها

نجمع البيانات التي تقدمها لنا طوعاً من خلال نماذج التسجيل والتواصل، ونستخدمها حصرياً للرد على استفساراتك وتقديم خدماتنا التدريبية.

## حماية البيانات

نطبق إجراءات أمنية مناسبة لحماية بياناتك من الوصول غير المصرح به أو الإفصاح أو التعديل.

## اتصل بنا

لأي استفسار حول سياسة الخصوصية، يرجى التواصل معنا عبر صفحة اتصل بنا.`;

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l = (locale === "ar" ? "ar" : "en") as "en" | "ar";
  setRequestLocale(locale);

  const settings = await getSettings();
  const title = settings[`page_privacy_title_${l}`] || (l === "ar" ? "سياسة الخصوصية" : "Privacy Policy");
  const subtitle = settings[`page_privacy_subtitle_${l}`] || (l === "ar" ? "كيف نتعامل مع بياناتك" : "How we handle your data");
  const raw = settings[`page_privacy_${l}`] || (l === "ar" ? FALLBACK_AR : FALLBACK_EN);
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
