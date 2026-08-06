"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSuperCategory, updateSuperCategory } from "@/app/admin/(protected)/actions-taxonomy";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Initial = { id?: string; slug: string; nameEn: string; nameAr?: string; image?: string; sort?: number; featured?: boolean };

export function SuperCategoryForm({ initial }: { initial?: Initial }) {
  const router = useRouter();
  const [form, setForm] = useState({
    slug: initial?.slug ?? "",
    nameEn: initial?.nameEn ?? "",
    nameAr: initial?.nameAr ?? "",
    image: initial?.image ?? "",
    sort: String(initial?.sort ?? 0),
    featured: initial?.featured ?? false,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof typeof form>(k: K, v: typeof form[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const payload = { ...form, sort: Number(form.sort) };
      if (initial?.id) {
        await updateSuperCategory(initial.id, payload);
      } else {
        await createSuperCategory(payload);
      }
      router.refresh();
      if (!initial?.id) setForm({ slug: "", nameEn: "", nameAr: "", image: "", sort: "0", featured: false });
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
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Slug" value={form.slug} onChange={(v) => set("slug", v)} required />
        <Field label="Name (EN)" value={form.nameEn} onChange={(v) => set("nameEn", v)} required />
        <Field label="Name (AR)" value={form.nameAr} onChange={(v) => set("nameAr", v)} rtl />
        <Field label="Image" value={form.image} onChange={(v) => set("image", v)} />
        <Field label="Sort" value={form.sort} onChange={(v) => set("sort", v)} />
        <div className="flex items-end gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} />
            Featured
          </label>
          <Button type="submit" disabled={busy} className="ml-auto">
            {initial?.id ? "Update" : "Add Super Category"}
          </Button>
        </div>
      </div>
    </form>
  );
}

function Field({ label, value, onChange, required, rtl }: { label: string; value: string; onChange: (v: string) => void; required?: boolean; rtl?: boolean }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} required={required} dir={rtl ? "rtl" : undefined} />
    </div>
  );
}