"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveSettings } from "@/app/admin/(protected)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Field = {
  key: string;
  label: string;
  bilingual?: boolean;
  long?: boolean;
};

type Group = { title: string; hint: string; fields: Field[] };

const GROUPS: Group[] = [
  {
    title: "Homepage Hero & CTA",
    hint: "Shown in the EN and AR versions of the homepage.",
    fields: [
      { key: "hero_title", label: "Hero headline", bilingual: true },
      { key: "hero_subtitle", label: "Hero subtitle", bilingual: true, long: true },
      { key: "about_text", label: "About / why us paragraph", bilingual: true, long: true },
      { key: "cta_title", label: "Bottom CTA title", bilingual: true },
      { key: "cta_subtitle", label: "Bottom CTA subtitle", bilingual: true },
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
      { key: "contact_phone", label: "Contact phone" },
      { key: "contact_email", label: "Contact email" },
      { key: "contact_whatsapp", label: "WhatsApp number" },
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
];

export function SiteContentForm({ initial }: { initial: Record<string, string> }) {
  const router = useRouter();
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
  const [saving, setSaving] = useState(false);

  return (
    <form
      className="space-y-8"
      onSubmit={(e) => {
        e.preventDefault();
        void (async () => {
          setSaving(true);
          await saveSettings(form, { host: "", port: "587", user: "", pass: "", from: "" });
          setSaving(false);
          router.refresh();
        })();
      }}
    >
      {GROUPS.map((g) => (
        <div key={g.title}>
          <h3 className="text-sm font-semibold text-navy">{g.title}</h3>
          <p className="mb-3 mt-0.5 text-xs text-muted-foreground">{g.hint}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {g.fields.map((f) =>
              f.bilingual ? (
                <div key={f.key} className="grid gap-2 sm:col-span-2 sm:grid-cols-2">
                  <div>
                    <Label>{f.label} — English</Label>
                    {f.long ? (
                      <Textarea value={form[`${f.key}_en`]} onChange={(e) => setForm((x) => ({ ...x, [`${f.key}_en`]: e.target.value }))} rows={3} />
                    ) : (
                      <Input value={form[`${f.key}_en`]} onChange={(e) => setForm((x) => ({ ...x, [`${f.key}_en`]: e.target.value }))} />
                    )}
                  </div>
                  <div>
                    <Label>{f.label} — عربي</Label>
                    {f.long ? (
                      <Textarea value={form[`${f.key}_ar`]} onChange={(e) => setForm((x) => ({ ...x, [`${f.key}_ar`]: e.target.value }))} rows={3} />
                    ) : (
                      <Input value={form[`${f.key}_ar`]} onChange={(e) => setForm((x) => ({ ...x, [`${f.key}_ar`]: e.target.value }))} />
                    )}
                  </div>
                </div>
              ) : (
                <div key={f.key}>
                  <Label>{f.label}</Label>
                  <Input value={form[f.key]} onChange={(e) => setForm((x) => ({ ...x, [f.key]: e.target.value }))} />
                </div>
              )
            )}
          </div>
        </div>
      ))}
      <Button type="submit" disabled={saving}>
        {saving ? "Saving…" : "Save Content"}
      </Button>
    </form>
  );
}