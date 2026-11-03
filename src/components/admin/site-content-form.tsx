"use client";

import { useUnsavedChanges } from "./unsaved-changes";
import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { saveSettings } from "@/app/admin/(protected)/actions-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UploadInput } from "@/components/admin/upload-input";

type Field = {
  key: string;
  label: string;
  bilingual?: boolean;
  long?: boolean;
  rows?: number;
  type?: "text" | "upload";
};

type Group = { title: string; hint: string; fields: Field[] };

const GROUPS: Group[] = [
  {
    title: "Homepage Hero & CTA",
    hint: "Shown in the EN and AR versions of the homepage.",
    fields: [
      { key: "hero_title", label: "Hero headline", bilingual: true },
      { key: "hero_subtitle", label: "Hero subtitle", bilingual: true, long: true },
      { key: "hero_image", label: "Hero background image", type: "upload" },
      { key: "hero_badge", label: "Hero badge text (e.g. Globally Accredited Training)", bilingual: true },
      { key: "stat_courses", label: "Stats label — Courses", bilingual: true },
      { key: "stat_venues", label: "Stats label — Venues", bilingual: true },
      { key: "stat_subjects", label: "Stats label — Subjects", bilingual: true },
      { key: "about_text", label: "About / why us paragraph", bilingual: true, long: true },
      { key: "badge_accredited", label: "About badge — Accredited", bilingual: true },
      { key: "badge_trainers", label: "About badge — Trainers", bilingual: true },
      { key: "badge_programmes", label: "About badge — Programmes", bilingual: true },
      { key: "cta_title", label: "Bottom CTA title", bilingual: true },
      { key: "cta_subtitle", label: "Bottom CTA subtitle", bilingual: true },
    ],
  },
  {
    title: "Training Formats",
    hint: "Three training format cards on the homepage.",
    fields: [
      { key: "format_classroom_title", label: "Classroom — Title", bilingual: true },
      { key: "format_classroom_desc", label: "Classroom — Description", bilingual: true, long: true },
      { key: "format_online_title", label: "Online — Title", bilingual: true },
      { key: "format_online_desc", label: "Online — Description", bilingual: true, long: true },
      { key: "format_inhouse_title", label: "In-House — Title", bilingual: true },
      { key: "format_inhouse_desc", label: "In-House — Description", bilingual: true, long: true },
    ],
  },
  {
    title: "Homepage Section Headings",
    hint: "Headlines above each homepage section (EN / AR). Leave blank to use defaults.",
    fields: [
      { key: "section_categories", label: "Our subjects heading", bilingual: true },
      { key: "section_venues", label: "Training locations heading", bilingual: true },
      { key: "section_formats", label: "Training formats heading", bilingual: true },
      { key: "section_featured", label: "Popular courses heading", bilingual: true },
      { key: "section_about", label: "Why us heading", bilingual: true },
      { key: "section_certificates", label: "Certificates heading", bilingual: true },
      { key: "section_clients", label: "Clients heading", bilingual: true },
      { key: "section_articles", label: "Blog heading", bilingual: true },
    ],
  },
  {
    title: "Brand & Contact",
    hint: "Used across the site header and footer.",
    fields: [
      { key: "brand_tagline", label: "Brand tagline", bilingual: true },
      { key: "contact_address", label: "Address", bilingual: true, long: true },
    ],
  },
  {
    title: "Social Links",
    hint: "URLs shown as social icons.",
    fields: [
      { key: "social_facebook", label: "Facebook" },
      { key: "social_instagram", label: "Instagram" },
      { key: "social_linkedin", label: "LinkedIn" },
      { key: "social_twitter", label: "X (Twitter)" },
      { key: "social_youtube", label: "YouTube" },
    ],
  },
  {
    title: "Static Pages",
    hint: "Edit About Us, Privacy Policy and Terms of Service. Use ## Heading for section titles, paragraphs separated by blank lines.",
    fields: [
      { key: "about_title", label: "About Us — Page title", bilingual: true },
      { key: "about_subtitle", label: "About Us — Subtitle", bilingual: true },
      { key: "page_about", label: "About Us — Body content", bilingual: true, long: true, rows: 8 },
      { key: "page_privacy", label: "Privacy Policy — Full content", bilingual: true, long: true, rows: 10 },
      { key: "page_terms", label: "Terms of Service — Full content", bilingual: true, long: true, rows: 10 },
    ],
  },
  {
    title: "Contact Us Page",
    hint: "Configure the Contact Us page title and subtitle.",
    fields: [
      { key: "contact_title", label: "Contact Us — Page title", bilingual: true },
      { key: "contact_subtitle", label: "Contact Us — Subtitle", bilingual: true, long: true },
    ],
  },
  {
    title: "Other Page Headers",
    hint: "Configure titles and subtitles for listing pages.",
    fields: [
      { key: "page_countries_title", label: "Countries — Page title", bilingual: true },
      { key: "page_countries_subtitle", label: "Countries — Subtitle", bilingual: true },
      { key: "page_certificates_title", label: "Certificates — Page title", bilingual: true },
      { key: "page_certificates_subtitle", label: "Certificates — Subtitle", bilingual: true },
      { key: "page_resources_title", label: "Resources — Page title", bilingual: true },
      { key: "page_resources_subtitle", label: "Resources — Subtitle", bilingual: true },
      { key: "page_subjects_title", label: "Training Subjects — Page title", bilingual: true },
      { key: "page_subjects_subtitle", label: "Training Subjects — Subtitle", bilingual: true, long: true },
    ],
  },
];

export function SiteContentForm({ initial }: { initial: Record<string, string> }) {
  const router = useRouter();
  const id = useId();
  const [editingLanguage, setEditingLanguage] = useState("both");
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<Record<string, string>>(() => {
    const base: Record<string, string> = {};
    for (const g of GROUPS) {
      for (const f of g.fields) {
        if (f.bilingual) {
          base[`${f.key}_en`] = initial[`${f.key}_en`] ?? "";
          base[`${f.key}_ar`] = initial[`${f.key}_ar`] ?? "";
        } else {
          base[f.key] = initial[f.key] ?? "";
        }
      }
    }
    return base;
  });
  const markSaved = useUnsavedChanges(form);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  return (
    <form
      className="space-y-8"
      onSubmit={(e) => {
        e.preventDefault();
        void (async () => {
          setSaving(true);
          setError("");
          setSaved(false);
          try {
            await saveSettings(form, { host: "", port: "587", user: "", pass: "", from: "" });
            markSaved();
            router.refresh();
            setSaved(true);
          } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
          } finally {
            setSaving(false);
          }
        })();
      }}
    >
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}
      {saved && <p role="status">Site content saved.</p>}
      <div>
        <Label htmlFor={`${id}-language`}>Editing language</Label>
        <select id={`${id}-language`} value={editingLanguage} onChange={(event) => setEditingLanguage(event.target.value)} className="mt-1 block rounded border p-2">
          <option value="both">English & Arabic</option><option value="en">English</option><option value="ar">Arabic</option>
        </select>
        <p className="mt-2 text-sm text-muted-foreground">Filters the translation fields only. The other language is preserved. Contact details are managed in Site Contact Info below.</p>
      </div>
      {GROUPS.map((g) => (
        <div key={g.title}>
          <h3 className="text-sm font-semibold text-navy">{g.title}</h3>
          <p className="mb-3 mt-0.5 text-xs text-muted-foreground">{g.hint}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {g.fields.map((f) => {
              if (f.type === "upload") {
                return (
                  <div key={f.key} className="sm:col-span-2">
                    <Label>{f.label}</Label>
                    <div className="space-y-1.5">
                      <UploadInput value={form[f.key] ?? ""} onChange={(v) => setForm((x) => ({ ...x, [f.key]: v }))} kind="image" label={f.label} />
                      <input
                        value={form[f.key] ?? ""}
                        onChange={(e) => setForm((x) => ({ ...x, [f.key]: e.target.value }))}
                        placeholder="…or paste a URL"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                );
              }
              if (f.bilingual) {
                return (
                  <div key={f.key} className="grid gap-2 sm:col-span-2 sm:grid-cols-2">
                    <div hidden={editingLanguage === "ar"}>
                      <Label htmlFor={`${id}-${f.key}-en`}>{f.label} — English</Label>
                      {f.long ? (
                        <Textarea id={`${id}-${f.key}-en`} value={form[`${f.key}_en`]} onChange={(e) => setForm((x) => ({ ...x, [`${f.key}_en`]: e.target.value }))} rows={f.rows || 3} />
                      ) : (
                        <Input id={`${id}-${f.key}-en`} value={form[`${f.key}_en`]} onChange={(e) => setForm((x) => ({ ...x, [`${f.key}_en`]: e.target.value }))} />
                      )}
                    </div>
                    <div hidden={editingLanguage === "en"}>
                      <Label htmlFor={`${id}-${f.key}-ar`}>{f.label} — عربي</Label>
                      {f.long ? (
                        <Textarea id={`${id}-${f.key}-ar`} dir="rtl" value={form[`${f.key}_ar`]} onChange={(e) => setForm((x) => ({ ...x, [`${f.key}_ar`]: e.target.value }))} rows={f.rows || 3} />
                      ) : (
                        <Input id={`${id}-${f.key}-ar`} dir="rtl" value={form[`${f.key}_ar`]} onChange={(e) => setForm((x) => ({ ...x, [`${f.key}_ar`]: e.target.value }))} />
                      )}
                    </div>
                  </div>
                );
              }
              return (
                <div key={f.key}>
                  <Label>{f.label}</Label>
                  <Input value={form[f.key]} onChange={(e) => setForm((x) => ({ ...x, [f.key]: e.target.value }))} />
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <Button type="submit" disabled={saving}>
        {saving ? "Saving…" : "Save Content"}
      </Button>
    </form>
  );
}