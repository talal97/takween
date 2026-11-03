"use client";

import { useUnsavedChanges } from "./unsaved-changes";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTestimonial, updateTestimonial } from "@/app/admin/(protected)/actions-content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Course = { id: string; titleEn: string | null; titleAr?: string | null };
type Category = { id: string; nameEn: string };

type Initial = {
  id?: string;
  textEn: string;
  textAr?: string;
  author: string;
  company?: string;
  featured?: boolean;
  sort?: number;
  courseId?: string;
  categoryId?: string;
};

export function TestimonialForm({ initial, courses = [], categories = [] }: { initial?: Initial; courses?: Course[]; categories?: Category[] }) {
  const router = useRouter();
  const [form, setForm] = useState({
    textEn: initial?.textEn ?? "",
    textAr: initial?.textAr ?? "",
    author: initial?.author ?? "",
    company: initial?.company ?? "",
    featured: initial?.featured ?? false,
    sort: String(initial?.sort ?? 0),
    courseId: initial?.courseId ?? "",
    categoryId: initial?.categoryId ?? "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const markSaved = useUnsavedChanges(form);

  function set<K extends keyof typeof form>(k: K, v: typeof form[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const payload = {
        ...form,
        sort: Number(form.sort),
        courseId: form.courseId || undefined,
        categoryId: form.categoryId || undefined,
      };
      if (initial?.id) {
        await updateTestimonial(initial.id, payload);
      } else {
        await createTestimonial(payload);
      }
      markSaved();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}
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
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Related Course (optional)</Label>
          <select
            value={form.courseId}
            onChange={(e) => set("courseId", e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">None</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.titleEn || c.titleAr || "Untitled"}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label>Related Category (optional)</Label>
          <select
            value={form.categoryId}
            onChange={(e) => set("categoryId", e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">None</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.nameEn}</option>
            ))}
          </select>
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
