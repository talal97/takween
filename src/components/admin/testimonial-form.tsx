"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTestimonial, updateTestimonial } from "@/app/admin/(protected)/actions-content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Initial = {
  id?: string;
  textEn: string;
  textAr?: string;
  author: string;
  company?: string;
  featured?: boolean;
  sort?: number;
};

export function TestimonialForm({ initial }: { initial?: Initial }) {
  const router = useRouter();
  const [form, setForm] = useState({
    textEn: initial?.textEn ?? "",
    textAr: initial?.textAr ?? "",
    author: initial?.author ?? "",
    company: initial?.company ?? "",
    featured: initial?.featured ?? false,
    sort: String(initial?.sort ?? 0),
  });
  const [busy, setBusy] = useState(false);

  function set<K extends keyof typeof form>(k: K, v: typeof form[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const payload = { ...form, sort: Number(form.sort) };
    if (initial?.id) {
      await updateTestimonial(initial.id, payload);
    } else {
      await createTestimonial(payload);
    }
    setBusy(false);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label>Testimonial (EN)</Label>
        <Textarea rows={3} value={form.textEn} onChange={(e) => set("textEn", e.target.value)} required />
      </div>
      <div>
        <Label>Testimonial (AR)</Label>
        <Textarea rows={3} dir="rtl" value={form.textAr} onChange={(e) => set("textAr", e.target.value)} />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label>Author</Label>
          <Input value={form.author} onChange={(e) => set("author", e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label>Company</Label>
          <Input value={form.company} onChange={(e) => set("company", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Sort</Label>
          <Input value={form.sort} onChange={(e) => set("sort", e.target.value)} />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} />
        Featured
      </label>
      <div className="flex justify-end">
        <Button type="submit" disabled={busy}>
          {initial?.id ? "Update" : "Add Testimonial"}
        </Button>
      </div>
    </form>
  );
}