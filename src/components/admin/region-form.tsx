"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createRegion } from "@/app/admin/(protected)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegionForm() {
  const router = useRouter();
  const [form, setForm] = useState({ slug: "", nameEn: "", nameAr: "", sort: "0" });
  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await createRegion({ ...form, sort: Number(form.sort) });
        setForm({ slug: "", nameEn: "", nameAr: "", sort: "0" });
        router.refresh();
      }}
      className="grid gap-4 sm:grid-cols-2"
    >
      <div>
        <Label>Slug</Label>
        <Input value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="europe" required />
      </div>
      <div>
        <Label>Sort</Label>
        <Input type="number" value={form.sort} onChange={(e) => set("sort", e.target.value)} />
      </div>
      <div>
        <Label>Name (EN)</Label>
        <Input value={form.nameEn} onChange={(e) => set("nameEn", e.target.value)} required />
      </div>
      <div>
        <Label>Name (AR)</Label>
        <Input dir="rtl" value={form.nameAr} onChange={(e) => set("nameAr", e.target.value)} />
      </div>
      <div className="sm:col-span-2">
        <Button type="submit">Add Region</Button>
      </div>
    </form>
  );
}