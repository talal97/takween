"use client";

import { useUnsavedChanges } from "./unsaved-changes";

import { ContentPreview } from "./content-preview";
import { RevisionHistory } from "./revision-history";
import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { createArticle, updateArticle } from "@/app/admin/(protected)/actions-content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UploadInput } from "@/components/admin/upload-input";

type Initial = {
  id?: string;
  slug: string;
  titleEn: string;
  titleAr?: string;
  excerptEn?: string;
  excerptAr?: string;
  bodyEn?: string;
  bodyAr?: string;
  status?: string;
  locale?: string;
  type?: string;
  image?: string;
};

export function ArticleForm({ initial }: { initial?: Initial }) {
  const router = useRouter();
  const [form, setForm] = useState({
    slug: initial?.slug ?? "",
    titleEn: initial?.titleEn ?? "",
    titleAr: initial?.titleAr ?? "",
    excerptEn: initial?.excerptEn ?? "",
    excerptAr: initial?.excerptAr ?? "",
    bodyEn: initial?.bodyEn ?? "",
    bodyAr: initial?.bodyAr ?? "",
    locale: (initial?.locale ?? "both") as "en" | "ar" | "both",
    status: (initial?.status ?? "published") as "published" | "draft",
    type: (initial?.type ?? "article") as "article" | "press" | "case_study",
    image: initial?.image ?? "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const formId = useId();

  const markSaved = useUnsavedChanges(form);

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setSaved(false);
    try {
      if (initial?.id) {
        await updateArticle(initial.id, form);
      } else {
        const id = await createArticle(form);
        markSaved();
        router.push(`/admin/articles/${id}`);
      }
      markSaved();
      router.refresh();
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setBusy(false);
    }
  }

  const languages = form.locale === "both" ? ["en", "ar"] as const : [form.locale];
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <ContentPreview kind="article" data={form} />
      {initial?.id && <RevisionHistory kind="article" entityId={initial.id} />}
      {error && <p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
      {saved && <p role="status" className="rounded border p-3">Article saved successfully.</p>}
      <fieldset disabled={busy} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor={`${formId}-slug`}>Slug</Label>
            <Input id={`${formId}-slug`} value={form.slug} onChange={(e) => set("slug", e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${formId}-locale`}>Website visibility</Label>
            <select id={`${formId}-locale`} value={form.locale} onChange={(e) => set("locale", e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="both">Both (English & Arabic)</option>
              <option value="en">English Only</option>
              <option value="ar">Arabic Only</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${formId}-type`}>Type</Label>
            <select id={`${formId}-type`} value={form.type} onChange={(e) => set("type", e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="article">Article</option><option value="press">Press Release</option><option value="case_study">Case Study</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${formId}-status`}>Status</Label>
            <select id={`${formId}-status`} value={form.status} onChange={(e) => set("status", e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="published">Published</option><option value="draft">Draft</option>
            </select>
          </div>
        </div>
        <p role="status" className="text-sm text-muted-foreground">
          {form.status === "draft" ? "Draft: hidden from both websites." : form.locale === "both" ? "Published on both websites. Missing translations fall back to the available language." : `Published only on the ${form.locale === "en" ? "English" : "Arabic"} website.`} Switching visibility keeps the other language&apos;s content.
        </p>
        {languages.map((language) => {
          const ar = language === "ar";
          const title = ar ? "titleAr" : "titleEn";
          const excerpt = ar ? "excerptAr" : "excerptEn";
          const body = ar ? "bodyAr" : "bodyEn";
          return <section key={language} className="space-y-3 rounded border p-4">
            <h3 className="font-semibold">{ar ? "Arabic content" : "English content"}</h3>
            <div>
              <Label htmlFor={`${formId}-${title}`}>Title ({language.toUpperCase()})</Label>
              <Input id={`${formId}-${title}`} dir={ar ? "rtl" : "ltr"} value={form[title]} onChange={(e) => set(title, e.target.value)} required={form.locale !== "both" || !(ar ? form.titleEn : form.titleAr).trim()} />
            </div>
            <div>
              <Label htmlFor={`${formId}-${excerpt}`}>Excerpt ({language.toUpperCase()})</Label>
              <Textarea id={`${formId}-${excerpt}`} dir={ar ? "rtl" : "ltr"} rows={2} value={form[excerpt]} onChange={(e) => set(excerpt, e.target.value)} />
            </div>
            <div>
              <Label htmlFor={`${formId}-${body}`}>Body ({language.toUpperCase()})</Label>
              <Textarea id={`${formId}-${body}`} dir={ar ? "rtl" : "ltr"} rows={6} value={form[body]} onChange={(e) => set(body, e.target.value)} />
            </div>
          </section>;
        })}
        <div className="space-y-1.5">
          <UploadInput value={form.image} onChange={(v) => set("image", v)} kind="image" label="Featured Image" />
          <Label htmlFor={`${formId}-image`}>Featured image URL</Label>
          <Input id={`${formId}-image`} value={form.image} onChange={(e) => set("image", e.target.value)} placeholder="…or paste a URL" />
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={busy}>{busy ? "Saving…" : initial?.id ? "Update Article" : "Add Article"}</Button>
        </div>
      </fieldset>
    </form>
  );
}
