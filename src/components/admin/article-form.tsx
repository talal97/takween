"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createArticle, updateArticle } from "@/app/admin/(protected)/actions-content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
    status: initial?.status ?? "published",
  });
  const [busy, setBusy] = useState(false);

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    if (initial?.id) {
      await updateArticle(initial.id, form);
    } else {
      await createArticle(form);
    }
    setBusy(false);
    router.refresh();
    if (!initial?.id) setForm({ slug: "", titleEn: "", titleAr: "", excerptEn: "", excerptAr: "", bodyEn: "", bodyAr: "", status: "published" });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Slug</Label>
          <Input value={form.slug} onChange={(e) => set("slug", e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label>Title (EN)</Label>
          <Input value={form.titleEn} onChange={(e) => set("titleEn", e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label>Title (AR)</Label>
          <Input dir="rtl" value={form.titleAr} onChange={(e) => set("titleAr", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Status</Label>
          <select value={form.status} onChange={(e) => set("status", e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>
      <div>
        <Label>Excerpt (EN)</Label>
        <Textarea rows={2} value={form.excerptEn} onChange={(e) => set("excerptEn", e.target.value)} />
      </div>
      <div>
        <Label>Body (EN)</Label>
        <Textarea rows={6} value={form.bodyEn} onChange={(e) => set("bodyEn", e.target.value)} />
      </div>
      <div>
        <Label>Body (AR)</Label>
        <Textarea dir="rtl" rows={6} value={form.bodyAr} onChange={(e) => set("bodyAr", e.target.value)} />
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={busy}>
          {initial?.id ? "Update" : "Add Article"}
        </Button>
      </div>
    </form>
  );
}