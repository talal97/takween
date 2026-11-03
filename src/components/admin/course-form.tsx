"use client";

import { confirmDiscardChanges, useUnsavedChanges } from "./unsaved-changes";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { ContentPreview } from "./content-preview";
import { RevisionHistory } from "./revision-history";
import { Plus, Trash2 } from "lucide-react";
import { createCourse, updateCourse } from "@/app/admin/(protected)/course-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UploadInput } from "@/components/admin/upload-input";

type Category = { id: string; nameEn: string };
type Venue = { id: string; nameEn: string; country: string };
type Cert = { id: string; nameEn: string };

type ScheduleRow = {
  active: boolean;
  venueId: string;
  startDate: string;
  endDate: string;
  fee: string;
  currency: string;
  format: string;
};

type DayRow = { day: number; title: string; topics: string };

type CourseDraft = {
  code: string;
  slug: string;
  locale: string;
  image: string;
  titleEn: string | null;
  titleAr: string | null;
  subtitleEn: string;
  subtitleAr: string;
  badgeEn: string;
  badgeAr: string;
  durationDays: string;
  categoryId: string;
  featured: boolean;
  introEn: string;
  introAr: string;
  objectivesEn: string;
  objectivesAr: string;
  methodologyEn: string;
  methodologyAr: string;
  orgImpactEn: string;
  orgImpactAr: string;
  personalImpactEn: string;
  personalImpactAr: string;
  targetAudienceEn: string;
  targetAudienceAr: string;
  certificateNoteEn: string;
  certificateNoteAr: string;
  seoTitleEn: string;
  seoTitleAr: string;
};

const emptyDraft: CourseDraft = {
  code: "",
  slug: "",
  locale: "both",
  image: "",
  titleEn: "",
  titleAr: "",
  subtitleEn: "",
  subtitleAr: "",
  badgeEn: "",
  badgeAr: "",
  durationDays: "5",
  categoryId: "",
  featured: false,
  introEn: "",
  introAr: "",
  objectivesEn: "",
  objectivesAr: "",
  methodologyEn: "",
  methodologyAr: "",
  orgImpactEn: "",
  orgImpactAr: "",
  personalImpactEn: "",
  personalImpactAr: "",
  targetAudienceEn: "",
  targetAudienceAr: "",
  certificateNoteEn: "",
  certificateNoteAr: "",
  seoTitleEn: "",
  seoTitleAr: "",
};

interface CourseFormProps {
  categories: Category[];
  venues: Venue[];
  certificates: Cert[];
  allCourses?: Array<{ id: string; titleEn: string | null; titleAr: string | null; code: string }>;
  id?: string;
  initial?: CourseDraft;
  existingDaysAr?: Array<{ day: number; title: string; topics: string[] }>;
  existingDays?: Array<{ day: number; title: string; topics: string[] }>;
  existingSchedules?: Array<{
    active?: boolean;
    venueId: string;
    startDate: Date | string;
    endDate: Date | string;
    fee: number | null;
    currency: string;
    format: string;
  }>;
  existingCertIds?: string[];
  existingRelatedIds?: string[];
}

export function CourseForm(props: CourseFormProps) {
  const router = useRouter();
  const [draft, setDraft] = useState<CourseDraft>(props.initial ?? emptyDraft);
  const [days, setDays] = useState<DayRow[]>(() =>
    (props.existingDays ?? [{ day: 1, title: "", topics: [] }]).map((d) => ({
      day: d.day,
      title: d.title,
      topics: (d.topics ?? []).join("\n"),
    }))
  );
  const [daysAr, setDaysAr] = useState<DayRow[]>(() =>
    (props.existingDaysAr ?? []).map((d) => ({ ...d, topics: (d.topics ?? []).join("\n") }))
  );
  const [schedules, setSchedules] = useState<ScheduleRow[]>(() =>
    (props.existingSchedules ?? [{ active: true, venueId: "", startDate: "", endDate: "", fee: "5950", currency: "USD", format: "classroom" }]).map((s) => ({
      active: s.active ?? true,
      venueId: s.venueId,
      startDate: s.startDate ? new Date(s.startDate).toISOString().slice(0, 10) : "",
      endDate: s.endDate ? new Date(s.endDate).toISOString().slice(0, 10) : "",
      fee: String(s.fee ?? 5950),
      currency: s.currency || "USD",
      format: s.format || "classroom",
    }))
  );
  const [certIds, setCertIds] = useState<string[]>(props.existingCertIds ?? []);
  const [relatedIds, setRelatedIds] = useState<string[]>(props.existingRelatedIds ?? []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const markSaved = useUnsavedChanges({ draft, days, daysAr, schedules, certIds, relatedIds });

  function set<K extends keyof CourseDraft>(key: K, value: CourseDraft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }
  function setSchedule(i: number, key: keyof ScheduleRow, value: string) {
    setSchedules((arr) => arr.map((row, idx) => (idx === i ? { ...row, [key]: value } : row)));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSaved(false);
    try {
      if ([...days, ...daysAr].some((day) => day.topics.trim() && !day.title.trim())) {
        setError("Add a title to each day with topics, or remove the unfinished day.");
        return;
      }
      const dayPayload = days
        .filter((d) => d.title)
        .map((d) => ({ day: d.day, title: d.title, topics: d.topics.split("\n").map((t) => t.trim()).filter(Boolean) }));
      const dayPayloadAr = daysAr.filter((d) => d.title).map((d) => ({ ...d, topics: d.topics.split("\n").map((t) => t.trim()).filter(Boolean) }));
      if (schedules.some((s) => (s.startDate || s.endDate || s.venueId) && (!s.startDate || !s.endDate || !s.venueId))) {
        setError("Complete the venue, start date and end date for each session, or remove the unfinished session.");
        return;
      }
      const schedulePayload = schedules
        .filter((s) => s.startDate && s.venueId)
        .map((s) => ({
          active: s.active ?? true,
      venueId: s.venueId,
          startDate: s.startDate,
          endDate: s.endDate,
          fee: Number(s.fee),
          currency: s.currency,
          format: s.format as "classroom" | "online" | "inhouse",
        }));
      const data = {
        ...draft,
        durationDays: Number(draft.durationDays),
      } as Parameters<typeof updateCourse>[1];

      if (props.id) {
        await updateCourse(props.id, data, schedulePayload, dayPayload, certIds, relatedIds, dayPayloadAr);
        markSaved();
        router.refresh();
      } else {
        await createCourse(data, schedulePayload, dayPayload, certIds, relatedIds, dayPayloadAr);
        markSaved();
        router.push("/admin/courses");
        markSaved();
        router.refresh();
      }
      setSaved(true);
    } catch {
      setError("Could not save the course. Check the required fields, dates, and whether the code or slug is already in use, then try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="flex flex-wrap gap-3"><ContentPreview kind="course" data={{ ...draft, dayOutlineEn: days, dayOutlineAr: daysAr, schedules: schedules.map((s) => ({ ...s, venueName: props.venues.find((v) => v.id === s.venueId)?.nameEn })) }} /></div>
      {props.id && <RevisionHistory kind="course" entityId={props.id} />}
      {error && <p role="alert" className="rounded border border-destructive p-3 text-destructive">{error}</p>}
      {saved && <p role="status" className="rounded border p-3">Course saved successfully.</p>}
      <section className="space-y-4 rounded border p-4">
        <h3 className="font-semibold">Basic Information</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Slug" value={draft.slug} onChange={(v) => set("slug", v)} placeholder="leed-green-associate" required />
          <Field label="Course Code" value={draft.code} onChange={(v) => set("code", v)} required />
          <Field label="Website visibility" type="select" value={draft.locale} onChange={(v) => set("locale", v)} required>
            <option value="both">Both (English & Arabic)</option>
            <option value="en">English Only</option>
            <option value="ar">Arabic Only</option>
          </Field>
        </div>
        <p role="status" className="text-sm text-muted-foreground">{draft.locale === "en" ? "This course appears only on the English website." : draft.locale === "ar" ? "This course appears only on the Arabic website." : "This course appears on both websites; both titles are required."} Switching visibility keeps your other language&apos;s text. Featured courses also need an upcoming session to appear on the homepage.</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Duration (days)" type="number" value={draft.durationDays} onChange={(v) => set("durationDays", v)} />
          <label className="flex items-center gap-2 pb-2 text-sm">
            <input type="checkbox" checked={draft.featured} onChange={(e) => set("featured", e.target.checked)} />
            Featured
          </label>
        </div>
        {(draft.locale === "en" || draft.locale === "both") && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title (EN)" value={draft.titleEn ?? ""} onChange={(v) => set("titleEn", v)} required={draft.locale === "en" || draft.locale === "both"} />
            <Field label="Subtitle (EN)" value={draft.subtitleEn ?? ""} onChange={(v) => set("subtitleEn", v)} />
            <Field label="Course badge (EN)" value={draft.badgeEn} onChange={(v) => set("badgeEn", v)} placeholder="Leave blank to use the course duration" />
          </div>
        )}
        {(draft.locale === "ar" || draft.locale === "both") && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title (AR)" value={draft.titleAr ?? ""} onChange={(v) => set("titleAr", v)} rtl required={draft.locale === "ar" || draft.locale === "both"} />
            <Field label="Subtitle (AR)" value={draft.subtitleAr ?? ""} onChange={(v) => set("subtitleAr", v)} rtl />
            <Field label="Course badge (AR)" value={draft.badgeAr} onChange={(v) => set("badgeAr", v)} rtl placeholder="Leave blank to use the course duration" />
          </div>
        )}
        <div>
          <Label>Course Image</Label>
          <UploadInput value={draft.image} onChange={(v) => set("image", v)} kind="image" label="Image" />
        </div>
        <div>
          <Field label="Category" type="select" value={draft.categoryId} onChange={(v) => set("categoryId", v)} required>
            <option value="">Select category</option>
            {props.categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nameEn}
              </option>
            ))}
          </Field>
        </div>
      </section>

      <section className="space-y-4 rounded border p-4">
        <h3 className="font-semibold">Course Content</h3>
        {(draft.locale === "en" || draft.locale === "both") && (
          <>
            <Area label="Introduction (EN)" value={draft.introEn} onChange={(v) => set("introEn", v)} />
            <Area label="Objectives (EN)" value={draft.objectivesEn} onChange={(v) => set("objectivesEn", v)} />
            <Area label="Training Methodology (EN)" value={draft.methodologyEn} onChange={(v) => set("methodologyEn", v)} />
            <Area label="Organisational Impact (EN)" value={draft.orgImpactEn} onChange={(v) => set("orgImpactEn", v)} />
            <Area label="Personal Impact (EN)" value={draft.personalImpactEn} onChange={(v) => set("personalImpactEn", v)} />
            <Area label="Target Audience (EN)" value={draft.targetAudienceEn} onChange={(v) => set("targetAudienceEn", v)} />
            <Area label="Certificate note (EN)" value={draft.certificateNoteEn} onChange={(v) => set("certificateNoteEn", v)} />
          </>
        )}
        {(draft.locale === "ar" || draft.locale === "both") && (
          <>
            <Area label="Introduction (AR)" value={draft.introAr} onChange={(v) => set("introAr", v)} rtl />
            <Area label="Objectives (AR)" value={draft.objectivesAr} onChange={(v) => set("objectivesAr", v)} rtl />
            <Area label="Training Methodology (AR)" value={draft.methodologyAr} onChange={(v) => set("methodologyAr", v)} rtl />
            <Area label="Organisational Impact (AR)" value={draft.orgImpactAr} onChange={(v) => set("orgImpactAr", v)} rtl />
            <Area label="Personal Impact (AR)" value={draft.personalImpactAr} onChange={(v) => set("personalImpactAr", v)} rtl />
            <Area label="Target Audience (AR)" value={draft.targetAudienceAr} onChange={(v) => set("targetAudienceAr", v)} rtl />
            <Area label="Certificate note (AR)" value={draft.certificateNoteAr} onChange={(v) => set("certificateNoteAr", v)} rtl />
          </>
        )}
      </section>

      <section className="space-y-4 rounded border p-4">
        <h3 className="font-semibold">SEO</h3>
        {(draft.locale === "en" || draft.locale === "both") && (
          <Field label="SEO Title (EN)" value={draft.seoTitleEn} onChange={(v) => set("seoTitleEn", v)} placeholder="Override page title for search engines" />
        )}
        {(draft.locale === "ar" || draft.locale === "both") && (
          <Field label="SEO Title (AR)" value={draft.seoTitleAr} onChange={(v) => set("seoTitleAr", v)} rtl placeholder="Override Arabic page title for search engines" />
        )}
      </section>

      {draft.locale !== "ar" && (
      <section className="space-y-3 rounded border p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Day-by-Day Outline (English)</h3>
          <Button type="button" size="sm" variant="outline" onClick={() => setDays((d) => [...d, { day: Math.max(0, ...d.map((row) => row.day)) + 1, title: "", topics: "" }])}>
            <Plus className="mr-1 h-4 w-4" /> Add Day
          </Button>
        </div>
        {days.map((d, i) => (
          <div key={i} className="space-y-3 rounded-md bg-muted/40 p-3">
            <div className="grid gap-3 sm:grid-cols-[80px_1fr]">
              <Field label="Day" type="number" value={String(d.day)} onChange={(v) => setDays((arr) => arr.map((r, idx) => (idx === i ? { ...r, day: Number(v) } : r)))} />
              <Field label="Day Title" value={d.title} onChange={(v) => setDays((arr) => arr.map((r, idx) => (idx === i ? { ...r, title: v } : r)))} />
            </div>
            <div>
              <Label className="mb-1.5 block text-sm">Topics (one per line)</Label>
              <Textarea aria-label={`English day ${d.day} topics`} rows={2} value={d.topics} onChange={(e) => setDays((arr) => arr.map((r, idx) => (idx === i ? { ...r, topics: e.target.value } : r)))} />
            </div>
            <div className="flex justify-end">
              <Button type="button" size="sm" variant="ghost" aria-label="Remove day" onClick={() => setDays((arr) => arr.filter((_, idx) => idx !== i))}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </section>

      )}
      {draft.locale !== "en" && (
      <section className="space-y-3 rounded border p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Day-by-Day Outline (Arabic)</h3>
          <Button type="button" size="sm" variant="outline" onClick={() => setDaysAr((d) => [...d, { day: Math.max(0, ...d.map((row) => row.day)) + 1, title: "", topics: "" }])}>
            <Plus className="mr-1 h-4 w-4" /> Add Day
          </Button>
        </div>
        {daysAr.map((d, i) => (
          <div key={i} className="space-y-3 rounded-md bg-muted/40 p-3">
            <div className="grid gap-3 sm:grid-cols-[80px_1fr]">
              <Field label="Day" type="number" value={String(d.day)} onChange={(v) => setDaysAr((arr) => arr.map((r, idx) => (idx === i ? { ...r, day: Number(v) } : r)))} />
              <Field label="Day Title (AR)" rtl value={d.title} onChange={(v) => setDaysAr((arr) => arr.map((r, idx) => (idx === i ? { ...r, title: v } : r)))} />
            </div>
            <div>
              <Label className="mb-1.5 block text-sm">Topics (one per line)</Label>
              <Textarea dir="rtl" aria-label="Arabic day topics" rows={2} value={d.topics} onChange={(e) => setDaysAr((arr) => arr.map((r, idx) => (idx === i ? { ...r, topics: e.target.value } : r)))} />
            </div>
            <div className="flex justify-end">
              <Button type="button" size="sm" variant="ghost" aria-label="Remove day" onClick={() => setDaysAr((arr) => arr.filter((_, idx) => idx !== i))}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </section>

      )}
      <section className="space-y-3 rounded border p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Sessions / Schedules</h3>
          <Button type="button" size="sm" variant="outline" onClick={() => setSchedules((s) => [...s, { active: true, venueId: props.venues[0]?.id || "", startDate: "", endDate: "", fee: "5950", currency: "USD", format: "classroom" }])}>
            <Plus className="mr-1 h-4 w-4" /> Add Session
          </Button>
        </div>
        {schedules.map((s, i) => (
          <div key={i} className="rounded-md bg-muted/40 p-3">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Venue" type="select" value={s.venueId} onChange={(v) => setSchedule(i, "venueId", v)}>
                <option value="">Select venue</option>
                {props.venues.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.nameEn} - {v.country}
                  </option>
                ))}
              </Field>
              <Field label="Start Date" type="date" value={s.startDate} onChange={(v) => setSchedule(i, "startDate", v)} />
              <Field label="End Date" type="date" value={s.endDate} onChange={(v) => setSchedule(i, "endDate", v)} />
              <Field label="Fee" type="number" value={s.fee} onChange={(v) => setSchedule(i, "fee", v)} />
              <Field label="Format" type="select" value={s.format} onChange={(v) => setSchedule(i, "format", v)}>
                <option value="classroom">Classroom</option>
                <option value="online">Online</option>
                <option value="inhouse">In-House</option>
              </Field>
              <Field label="Currency" type="select" value={s.currency} onChange={(v) => setSchedule(i, "currency", v)}>
                {!["SAR", "USD", "AED", "EUR", "GBP"].includes(s.currency) && <option>{s.currency}</option>}
                <option>SAR</option>
                <option>USD</option>
                <option>AED</option>
                <option>EUR</option>
                <option>GBP</option>
              </Field>
            </div>
            <div className="mt-2 flex justify-end">
              <Button type="button" size="sm" variant="ghost" aria-label="Remove session" onClick={() => setSchedules((arr) => arr.filter((_, idx) => idx !== i))}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </section>

      <section className="rounded border p-4">
        <h3 className="mb-3 font-semibold">Certificates</h3>
        <div className="flex flex-wrap gap-4">
          {props.certificates.map((c) => (
            <label key={c.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={certIds.includes(c.id)}
                onChange={(e) => setCertIds((prev) => (e.target.checked ? [...prev, c.id] : prev.filter((x) => x !== c.id)))}
              />
              {c.nameEn}
            </label>
          ))}
        </div>
      </section>

      {props.allCourses && props.allCourses.length > 0 && (
        <section className="rounded border p-4">
          <h3 className="mb-1 font-semibold">Related Courses</h3>
          <p className="mb-3 text-xs text-muted-foreground">
            Select courses to display as related on this course&apos;s public page.
          </p>
          <div className="grid gap-1.5 sm:grid-cols-2">
            {props.allCourses.map((c) => {
              const title = c.titleEn || c.titleAr || c.code || "Untitled";
              return (
                <label key={c.id} className="flex items-center gap-2 rounded-md border border-input px-3 py-2 text-sm hover:bg-muted/40">
                  <input
                    type="checkbox"
                    checked={relatedIds.includes(c.id)}
                    onChange={(e) => setRelatedIds((prev) => (e.target.checked ? [...prev, c.id] : prev.filter((x) => x !== c.id)))}
                  />
                  <span className="truncate">{title}</span>
                </label>
              );
            })}
          </div>
        </section>
      )}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={async () => { if (await confirmDiscardChanges()) router.push("/admin/courses"); }}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : props.id ? "Update Course" : "Create Course"}
        </Button>
      </div>
    </form>
  );
}

function Field(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  rtl?: boolean;
  placeholder?: string;
  children?: React.ReactNode;
}) {
  const id = useId();
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{props.label}</Label>
      {props.type === "select" ? (
        <select
          id={id}
          required={props.required}
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {props.children}
        </select>
      ) : (
        <Input id={id} type={props.type || "text"} value={props.value} onChange={(e) => props.onChange(e.target.value)} required={props.required} dir={props.rtl ? "rtl" : undefined} placeholder={props.placeholder} />
      )}
    </div>
  );
}

function Area(props: { label: string; value: string; onChange: (v: string) => void; rtl?: boolean }) {
  const id = useId();
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{props.label}</Label>
      <Textarea id={id} dir={props.rtl ? "rtl" : undefined} value={props.value} onChange={(e) => props.onChange(e.target.value)} rows={3} />
    </div>
  );
}
