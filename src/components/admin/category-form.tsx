"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCategory, updateCategory, deleteCategory } from "@/app/admin/(protected)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type SuperCat = { id: string; nameEn: string };

export function CategoryForm({
  superCats,
  initial,
}: {
  superCats: SuperCat[];
  initial?: {
    id: string;
    slug: string;
    nameEn: string;
    nameAr?: string;
    taglineEn?: string;
    descriptionEn?: string;
    superCategoryId?: string;
    featured?: boolean;
  };
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    slug: initial?.slug ?? "",
    nameEn: initial?.nameEn ?? "",
    nameAr: initial?.nameAr ?? "",
    taglineEn: initial?.taglineEn ?? "",
    descriptionEn: initial?.descriptionEn ?? "",
    superCategoryId: initial?.superCategoryId ?? "",
    featured: initial?.featured ?? false,
    sort: "0",
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { ...form, sort: Number(form.sort) };
    if (initial) {
      await updateCategory(initial.id, payload);
    } else {
      await createCategory(payload);
    }
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Slug" value={form.slug} onChange={(v) => set("slug", v)} required />
        <Field label="Name (EN)" value={form.nameEn} onChange={(v) => set("nameEn", v)} required />
        <Field label="Name (AR)" value={form.nameAr} onChange={(v) => set("nameAr", v)} rtl />
        <div className="space-y-1.5">
          <Label>Super Category</Label>
          <select
            value={form.superCategoryId}
            onChange={(e) => set("superCategoryId", e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">None</option>
            {superCats.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nameEn}
              </option>
            ))}
          </select>
        </div>
        <Field label="Tagline (EN)" value={form.taglineEn} onChange={(v) => set("taglineEn", v)} />
        <div className="sm:col-span-2">
          <div className="space-y-1.5">
            <Label>Description (EN)</Label>
            <Textarea rows={3} value={form.descriptionEn} onChange={(e) => set("descriptionEn", e.target.value)} />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} />
          Featured
        </label>
        <div className="flex items-end justify-end gap-2 sm:col-span-2">
          <Button type="submit">{initial ? "Update" : "Add Category"}</Button>
        </div>
      </div>
    </form>
  );
}

export function DeleteInList({ id, action, label = "Delete" }: { id: string; action: () => Promise<void>; label?: string }) {
  const router = useRouter();
  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={async () => {
        await action();
        router.refresh();
      }}
    >
      <span className="text-destructive">{label}</span>
    </Button>
  );
}

function Field(props: { label: string; value: string; onChange: (v: string) => void; required?: boolean; rtl?: boolean }) {
  return (
    <div className="space-y-1.5">
      <Label>{props.label}</Label>
      <Input value={props.value} onChange={(e) => props.onChange(e.target.value)} required={props.required} dir={props.rtl ? "rtl" : undefined} />
    </div>
  );
}