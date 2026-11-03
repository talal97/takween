"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";

export type PreviewData = Record<string, unknown>;
export function previewText(data: PreviewData, field: string, locale: "en" | "ar") {
  const preferred = data[`${field}${locale === "ar" ? "Ar" : "En"}`];
  const fallback = data[`${field}${locale === "ar" ? "En" : "Ar"}`];
  return typeof preferred === "string" && preferred.trim() ? preferred : typeof fallback === "string" ? fallback : "";
}

const sections = [
  ["intro", "Introduction", "المقدمة"], ["objectives", "Objectives", "الأهداف"],
  ["methodology", "Training Methodology", "منهجية التدريب"], ["orgImpact", "Organisational Impact", "الأثر على المؤسسة"],
  ["personalImpact", "Personal Impact", "الأثر الشخصي"], ["targetAudience", "Who should attend?", "الفئة المستهدفة"],
  ["certificateNote", "Certificates", "الشهادات"],
];

export function ContentPreview({ kind, data, label = "Preview / معاينة" }: { kind: "course" | "article"; data: PreviewData; label?: string }) {
  const [locale, setLocale] = useState<"en" | "ar">("en");
  const [mobile, setMobile] = useState(false);
  const ar = locale === "ar";
  const outline = ar ? data.dayOutlineAr ?? (data.locale === "ar" ? data.dayOutlineEn : null) : data.dayOutlineEn;
  const days = Array.isArray(outline) ? outline as Array<{ day: number; title: string; topics: string[] | string }> : [];
  const schedules = Array.isArray(data.schedules) ? data.schedules as Array<{ startDate: string; endDate: string; fee: string | number; currency: string; venueName?: string }> : [];
  return <Dialog.Root>
    <Dialog.Trigger asChild><Button type="button" variant="outline">{label}</Button></Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-[70] bg-black/60" />
      <Dialog.Content className="fixed left-1/2 top-1/2 z-[71] max-h-[90vh] w-[95vw] max-w-5xl -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-lg bg-white p-5 shadow-xl">
        <Dialog.Title className="text-xl font-semibold">Content preview / معاينة المحتوى</Dialog.Title>
        <Dialog.Description className="my-2 text-sm text-muted-foreground">Private preview of the current content. Nothing is saved or published. Site navigation and registration are not included. / معاينة خاصة دون حفظ أو نشر.</Dialog.Description>
        <div className="my-4 flex flex-wrap gap-2">
          <Button type="button" variant={ar ? "outline" : "default"} onClick={() => setLocale("en")}>English preview</Button>
          <Button type="button" variant={ar ? "default" : "outline"} onClick={() => setLocale("ar")}>معاينة العربية</Button>
          <Button type="button" variant="outline" aria-pressed={mobile} onClick={() => setMobile(!mobile)}>{mobile ? "Desktop width / سطح المكتب" : "Mobile width / الجوال"}</Button>
          <Dialog.Close asChild><Button type="button" variant="outline">Close / إغلاق</Button></Dialog.Close>
        </div>
        <article lang={locale} dir={ar ? "rtl" : "ltr"} className={`mx-auto space-y-6 rounded border bg-white p-5 ${mobile ? "max-w-[390px]" : "w-full"}`}>
          {(data.locale !== "both" && data.locale !== locale) && <p role="status" className="rounded bg-amber-50 p-3">{ar ? "هذا المحتوى غير ظاهر على الموقع العربي حسب إعدادات النشر الحالية." : "This content is not visible on the English website with the current visibility setting."}</p>}
          {data.status === "draft" && <p className="rounded bg-amber-50 p-3">{ar ? "مسودة — غير منشورة" : "Draft — not published"}</p>}
          <h1 className="text-3xl font-bold text-navy break-words">{previewText(data, "title", locale) || (ar ? "بدون عنوان" : "Untitled")}</h1>
          <p className="whitespace-pre-line">{previewText(data, kind === "article" ? "excerpt" : "subtitle", locale)}</p>
          {kind === "article" ? <div className="whitespace-pre-line break-words">{previewText(data, "body", locale)}</div> : <>
            {sections.map(([key, en, arabic]) => previewText(data, key, locale) && <section key={key}><h2 className="mb-2 text-xl font-semibold">{ar ? arabic : en}</h2><p className="whitespace-pre-line break-words">{previewText(data, key, locale)}</p></section>)}
            {days.length > 0 && <section><h2 className="text-xl font-semibold">{ar ? "محتوى الدورة" : "Course Outline"}</h2>{days.map((day, i) => <div key={i} className="mt-3"><h3 className="font-semibold">{ar ? "اليوم" : "Day"} {day.day}: {day.title}</h3><ul className="list-inside list-disc">{(Array.isArray(day.topics) ? day.topics : day.topics.split("\n")).filter(Boolean).map((topic, j) => <li key={j}>{topic}</li>)}</ul></div>)}</section>}
            {schedules.length > 0 && <section><h2 className="text-xl font-semibold">{ar ? "مواعيد الدورة" : "Scheduled Dates"}</h2>{schedules.map((schedule, i) => <p key={i} className="my-2" dir="ltr">{schedule.startDate?.slice(0, 10)} — {schedule.endDate?.slice(0, 10)} · {schedule.fee} {schedule.currency} {schedule.venueName}</p>)}</section>}
          </>}
        </article>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}
