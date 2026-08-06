"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCategory, updateCategory } from "@/app/admin/(protected)/actions-taxonomy";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UploadInput } from "@/components/admin/upload-input";

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
    taglineAr?: string;
    descriptionEn?: string;
    descriptionAr?: string;
    image?: string;
    icon?: string;
    superCategoryId?: string;
    featured?: boolean;
    sort?: number;
  };
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    slug: initial?.slug ?? "",
    nameEn: initial?.nameEn ?? "",
    nameAr: initial?.nameAr ?? "",
    taglineEn: initial?.taglineEn ?? "",
    taglineAr: initial?.taglineAr ?? "",
    descriptionEn: initial?.descriptionEn ?? "",
    descriptionAr: initial?.descriptionAr ?? "",
    image: initial?.image ?? "",
    icon: initial?.icon ?? "",
    superCategoryId: initial?.superCategoryId ?? "",
    featured: initial?.featured ?? false,
    sort: String(initial?.sort ?? 0),
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const payload = { ...form, sort: Number(form.sort) };
      if (initial) {
        await updateCategory(initial.id, payload);
      } else {
        await createCategory(payload);
      }
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
        <Field label="Tagline (AR)" value={form.taglineAr} onChange={(v) => set("taglineAr", v)} rtl />
        <div className="sm:col-span-2">
          <div className="space-y-1.5">
            <Label>Description (EN)</Label>
            <Textarea rows={3} value={form.descriptionEn} onChange={(e) => set("descriptionEn", e.target.value)} />
          </div>
        </div>
        <div className="sm:col-span-2">
          <div className="space-y-1.5">
            <Label>Description (AR)</Label>
            <Textarea rows={3} dir="rtl" value={form.descriptionAr} onChange={(e) => set("descriptionAr", e.target.value)} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Category Image</Label>
          <div className="space-y-1.5">
            <UploadInput value={form.image} onChange={(v) => set("image", v)} kind="image" label="Category Image" />
            <input
              value={form.image}
              onChange={(e) => set("image", e.target.value)}
              placeholder="…or paste a URL"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Category Icon</Label>
          <div className="space-y-1.5">
            <UploadInput value={form.icon} onChange={(v) => set("icon", v)} kind="image" label="Category Icon" />
            <input
              value={form.icon}
              onChange={(e) => set("icon", e.target.value)}
              placeholder="…or paste a URL"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>
        <Field label="Sort Order" value={form.sort} onChange={(v) => set("sort", v)} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} />
          Featured
        </label>
        <div className="flex items-end justify-end gap-2 sm:col-span-2">
          <Button type="submit" disabled={busy}>
            {busy ? "Saving…" : initial ? "Update" : "Add Category"}
          </Button>
        </div>
      </div>
    </form>
  );
}

export function DeleteInList({ action, label = "Delete" }: { id: string; action: () => Promise<void>; label?: string }) {
  const router = useRouter();
  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={async () => {
        if (!window.confirm("Are you sure you want to delete this item?")) return;
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