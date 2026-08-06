"use client";

import { useEffect, useState } from "react";
import { submitRegistration } from "@/lib/actions/registration";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { isoToFlag } from "@/lib/utils";

type Schedule = { id: string; venueId: string; venueName: string; startDate: string; endDate: string; fee: number; currency: string; format: string };
type RequestMode = "register" | "online" | "inhouse";

const MODES: RequestMode[] = ["register", "online", "inhouse"];

export function RegistrationForm({
  courseTitle,
  courseCode,
  schedules,
  countries,
  initialType = "register",
}: {
  courseTitle: string;
  courseCode: string;
  schedules: Schedule[];
  countries: Array<{ iso: string; nameEn: string; nameAr: string }>;
  initialType?: RequestMode;
}) {
  const t = useTranslations("form");
  const tc = useTranslations("common");
  const locale = useLocale();
  const [mode, setMode] = useState<RequestMode>(initialType);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    countryIso: "",
    company: "",
    designation: "",
    salutation: "Mr.",
    schedule: schedules[0]?.id || "",
    paymentMode: "invoice-me",
    message: "",
  });
  const [done, setDone] = useState(false);
  const [ref, setRef] = useState("");
  const [error, setError] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [captchaTs, setCaptchaTs] = useState(0);

  useEffect(() => {
    setCaptchaTs(Date.now());
  }, []);

  function refreshCaptcha() {
    setCaptcha("");
    setCaptchaTs(Date.now());
  }

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  const modeLabels: Record<RequestMode, string> = {
    register: tc("registerNow"),
    online: tc("online"),
    inhouse: tc("inHouse"),
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.email.includes("@")) {
      setError(t("invalidEmail"));
      return;
    }
    const schedule = schedules.find((s) => s.id === form.schedule);
    const country = countries.find((c) => c.iso === form.countryIso);
    const format = mode === "register" ? schedule?.format : mode;
    const res = await submitRegistration({
      type: mode,
      courseTitle,
      courseCode,
      scheduleSummary: schedule ? `${schedule.venueName} ${schedule.startDate}` : undefined,
      venueName: schedule?.venueName,
      startDate: schedule?.startDate,
      fee: schedule ? String(schedule.fee) : undefined,
      currency: schedule?.currency,
      format,
      salutation: form.salutation,
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      countryIso: form.countryIso,
      country: country ? (locale === "ar" && country.nameAr ? country.nameAr : country.nameEn) : undefined,
      company: form.company,
      designation: form.designation,
      paymentMode: form.paymentMode,
      message: form.message,
      locale,
      captcha,
      website: "",
    });
    if (!res?.ok) {
      if (res?.error === "captcha") {
        setError(t("captchaInvalid"));
        refreshCaptcha();
      } else if (res?.error === "too-many") {
        setError(t("tooMany"));
      } else {
        setError(t("invalidEmail"));
      }
      return;
    }
    setRef(res.ref || "");
    setDone(true);
  }

  if (done) {
    return (
      <div className="rounded-lg border p-6 text-center">
        <div className="mb-2 text-2xl">✓</div>
        <h3 className="font-semibold text-navy">{t("successTitle")}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{t("successMessage")}</p>
        {ref && (
          <p className="mt-3 text-sm text-muted-foreground">
            {t("successRef")}: <span className="font-mono font-semibold text-navy">{ref}</span>
          </p>
        )}
        <Link href="/training-courses" className="mt-4 inline-block text-sm font-medium text-brand underline hover:text-brand-dark">
          {t("successBrowse")}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="hidden" aria-hidden="true">
        <input tabIndex={-1} autoComplete="off" name="website" value="" onChange={() => {}} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {MODES.map((m) => (
          <button
            key={m}
            type="button"
            data-track={`register-mode-${m}`}
            onClick={() => setMode(m)}
            className={`rounded-md border px-2 py-2 text-xs font-semibold transition-colors ${
              mode === m ? "border-brand bg-brand text-white" : "border-input bg-background text-muted-foreground hover:border-brand/40 hover:text-brand"
            }`}
          >
            {modeLabels[m]}
          </button>
        ))}
      </div>
      <div className="grid gap-2">
        <Label>{t("courseTitle")}</Label>
        <Input value={courseTitle} readOnly className="bg-muted" />
      </div>
      {mode !== "inhouse" && schedules.length > 0 && (
        <div className="grid gap-2">
          <Label>{t("selectSchedule")}</Label>
          <select value={form.schedule} onChange={(e) => set("schedule", e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            {schedules.map((s) => (
              <option key={s.id} value={s.id}>
                {s.startDate} — {s.venueName} — {s.currency} {s.fee}
              </option>
            ))}
          </select>
        </div>
      )}
      {mode === "inhouse" && (
        <p className="rounded-md bg-brand-light px-3 py-2 text-xs text-brand">
          {locale === "ar"
            ? "سيتم تخصيص هذه الدورة وتقديمها في موقع مؤسستكم. سنتواصل معكم لمناقشة التفاصيل."
            : "This course will be delivered on-site at your organisation. Our team will contact you to discuss the details."}
        </p>
      )}
      <div className="grid gap-2">
        <Label>{t("fullName")}</Label>
        <Input value={form.fullName} onChange={(e) => set("fullName", e.target.value)} required />
      </div>
      <div className="grid gap-2">
        <Label>{t("email")}</Label>
        <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required />
      </div>
      <div className="grid gap-2">
        <Label>{t("phone")}</Label>
        <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
      </div>
      <div className="grid gap-2">
        <Label>{t("country")}</Label>
        <select value={form.countryIso} onChange={(e) => set("countryIso", e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="">{t("country")}</option>
          {countries.map((c) => (
            <option key={c.iso} value={c.iso}>
              {isoToFlag(c.iso)} {locale === "ar" && c.nameAr ? c.nameAr : c.nameEn}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label>{t("selectTitle")}</Label>
          <select value={form.salutation} onChange={(e) => set("salutation", e.target.value)} className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
            {["Dr.", "Mr.", "Mrs.", "Ms.", "Engr.", "Prof."].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <Label>{t("designation")}</Label>
          <Input value={form.designation} onChange={(e) => set("designation", e.target.value)} />
        </div>
      </div>
      <div className="grid gap-2">
        <Label>{t("company")}</Label>
        <Input value={form.company} onChange={(e) => set("company", e.target.value)} />
      </div>
      <div className="grid gap-2">
        <Label>{t("paymentMode")}</Label>
        <select value={form.paymentMode} onChange={(e) => set("paymentMode", e.target.value)} className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="invoice-me">{t("invoiceMe")}</option>
          <option value="invoice-company">{t("invoiceCompany")}</option>
        </select>
      </div>
      <div className="grid gap-2">
        <Label>{t("message")}</Label>
        <textarea rows={3} value={form.message} onChange={(e) => set("message", e.target.value)} className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
      </div>
      <div className="grid gap-2">
        <Label>{t("captcha")}</Label>
        <div className="flex items-center gap-3">
          {captchaTs > 0 ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={`/api/captcha?ts=${captchaTs}`} alt="captcha" className="h-10 w-36 rounded border bg-white" />
          ) : (
            <div className="h-10 w-36 animate-pulse rounded border bg-muted" />
          )}
          <button type="button" onClick={refreshCaptcha} className="text-xs font-medium text-navy underline">
            {t("refresh")}
          </button>
        </div>
        <Input
          value={captcha}
          onChange={(e) => setCaptcha(e.target.value)}
          placeholder={t("captchaPlaceholder")}
          required
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" data-track={`register-submit-${mode}`} className="w-full">{modeLabels[mode]}</Button>
    </form>
  );
}
