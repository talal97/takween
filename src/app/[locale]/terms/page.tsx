import { setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/site/page-header";

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l = (locale === "ar" ? "ar" : "en") as "en" | "ar";
  setRequestLocale(locale);

  return (
    <div>
      <PageHeader
        title={l === "ar" ? "شروط الاستخدام" : "Terms of Service"}
        subtitle={l === "ar" ? "شروط استخدام موقع تكوين" : "Terms for using the Takween website"}
      />
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h2 className="mb-3 text-xl font-semibold text-navy">
          {l === "ar" ? "محتوى الموقع" : "Website Content"}
        </h2>
        <p className="leading-relaxed text-muted-foreground">
          {l === "ar"
            ? "جميع المحتويات المعروضة على هذا الموقع هي لأغراض إعلامية فقط، وقد تتغير تفاصيل الدورات والمواعيد والأسعار دون إشعار مسبق."
            : "All content presented on this website is for informational purposes only, and course details, dates and fees may change without prior notice."}
        </p>
        <h2 className="mb-3 mt-8 text-xl font-semibold text-navy">
          {l === "ar" ? "التسجيل في الدورات" : "Course Registration"}
        </h2>
        <p className="leading-relaxed text-muted-foreground">
          {l === "ar"
            ? "إرسال نموذج التسجيل لا يعتبر تأكيداً نهائياً للمقعد في الدورة، وسيتواصل معك فريقنا لتأكيد التسجيل والتفاصيل."
            : "Submitting a registration form is not a final confirmation of your seat. Our team will contact you to confirm registration and details."}
        </p>
        <h2 className="mb-3 mt-8 text-xl font-semibold text-navy">
          {l === "ar" ? "اتصل بنا" : "Contact Us"}
        </h2>
        <p className="leading-relaxed text-muted-foreground">
          {l === "ar"
            ? "لأي استفسار حول هذه الشروط، يرجى التواصل معنا عبر صفحة اتصل بنا."
            : "For any questions about these terms, please reach out via our contact page."}
        </p>
      </div>
    </div>
  );
}
