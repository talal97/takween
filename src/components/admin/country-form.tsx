"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCountry, updateCountry } from "@/app/admin/(protected)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type CountryFormValues = {
  iso: string;
  nameEn: string;
  nameAr?: string;
  currency?: string;
};

export function CountryForm({ initial }: { initial?: CountryFormValues }) {
  const router = useRouter();
  const [values, setValues] = useState<CountryFormValues>(
    initial ?? { iso: "", nameEn: "", nameAr: "", currency: "" }
  );
  const [loading, setLoading] = useState(false);

  function set(key: keyof CountryFormValues, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    if (initial) {
      await updateCountry(initial.iso, values);
    } else {
      await createCountry(values);
    }
    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="iso">ISO Code</Label>
        <Input id="iso" value={values.iso} onChange={(e) => set("iso", e.target.value)} placeholder="AE" maxLength={3} required disabled={!!initial} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="currency">Currency</Label>
        <Input id="currency" value={values.currency} onChange={(e) => set("currency", e.target.value)} placeholder="AED" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="nameEn">English Name</Label>
        <Input id="nameEn" value={values.nameEn} onChange={(e) => set("nameEn", e.target.value)} placeholder="United Arab Emirates" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="nameAr">Arabic Name</Label>
        <Input id="nameAr" value={values.nameAr} onChange={(e) => set("nameAr", e.target.value)} placeholder="الإمارات العربية المتحدة" dir="rtl" />
      </div>
      <div className="sm:col-span-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : initial ? "Update Country" : "Add Country"}
        </Button>
      </div>
    </form>
  );
}