"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCertificate } from "@/app/admin/(protected)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CertificateForm() {
  const router = useRouter();
  const [form, setForm] = useState({ code: "", nameEn: "", nameAr: "", slug: "" });
  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await createCertificate(form);
        setForm({ code: "", nameEn: "", nameAr: "", slug: "" });
        router.refresh();
      }}
      className="grid gap-4 sm:grid-cols-2"
    >
      <div>
        <Label>Code</Label>
        <Input value={form.code} onChange={(e) => set("code", e.target.value)} placeholder="cpd" required />
      </div>
      <div>
        <Label>Name (EN)</Label>
        <Input value={form.nameEn} onChange={(e) => set("nameEn", e.target.value)} required />
      </div>
      <div>
        <Label>Name (AR)</Label>
        <Input dir="rtl" value={form.nameAr} onChange={(e) => set("nameAr", e.target.value)} />
      </div>
      <div>
        <Label>Slug</Label>
        <Input value={form.slug} onChange={(e) => set("slug", e.target.value)} />
      </div>
      <div className="sm:col-span-2">
        <Button type="submit">Add Certificate</Button>
      </div>
    </form>
  );
}