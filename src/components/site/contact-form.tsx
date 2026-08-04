"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { submitRegistration } from "@/lib/actions/registration";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ContactForm({ label }: { label: string }) {
  const locale = useLocale();
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", message: "" });
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [captchaTs, setCaptchaTs] = useState(0);
  const ar = locale === "ar";

  useEffect(() => {
    setCaptchaTs(Date.now());
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.email.includes("@")) {
      setError(ar ? "يرجى إدخال بريد إلكتروني صحيح" : "Please enter a valid email");
      return;
    }
    const res = await submitRegistration({
      type: "contact",
      courseTitle: "General Enquiry",
      salutation: "Mr.",
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      message: form.message,
      locale,
      captcha,
    });
    if (res?.ok) setDone(true);
    else if (res?.error === "captcha") {
      setError(ar ? "الرمز غير صحيح، يرجى المحاولة مرة أخرى" : "Incorrect code, please try again");
      setCaptcha("");
      setCaptchaTs(Date.now());
    }
  }

  if (done) {
    return (
      <div className="text-center">
        <div className="mb-2 text-2xl">✓</div>
        <p className="text-sm text-muted-foreground">{locale === "ar" ? "شكراً لك. سنتواصل معك قريباً." : "Thank you. We will contact you shortly."}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label>{locale === "ar" ? "الاسم الكامل" : "Full Name"}</Label>
        <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label>{locale === "ar" ? "البريد الإلكتروني" : "Email"}</Label>
          <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </div>
        <div className="grid gap-2">
          <Label>{locale === "ar" ? "الهاتف" : "Phone"}</Label>
          <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
      </div>
      <div className="grid gap-2">
        <Label>{locale === "ar" ? "رسالتك" : "Your Message"}</Label>
        <textarea rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="rounded-md border border-input bg-background px-3 py-2 text-sm" required />
      </div>
{error && <p className="text-sm text-destructive">{error}</p>}
      {/* honeypot */}
      <input type="hidden" tabIndex={-1} autoComplete="off" name="website" value="" onChange={() => {}} />
      <div className="grid gap-2">
        <Label>{ar ? "أدخل الرموز التي تراها" : "Enter the characters you see"}</Label>
        <div className="flex items-center gap-3">
          {captchaTs > 0 ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={`/api/captcha?ts=${captchaTs}`} alt="captcha" className="h-10 w-36 rounded border bg-white" />
          ) : (
            <div className="h-10 w-36 animate-pulse rounded border bg-muted" />
          )}
          <button type="button" onClick={() => { setCaptcha(""); setCaptchaTs(Date.now()); }} className="text-xs font-medium text-navy underline">
            {ar ? "تحديث" : "Refresh"}
          </button>
        </div>
        <Input value={captcha} onChange={(e) => setCaptcha(e.target.value)} required />
      </div>
      <Button type="submit" data-track="contact-submit" className="w-full">{label}</Button>
    </form>
  );
}