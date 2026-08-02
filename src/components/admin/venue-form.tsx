"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createVenue } from "@/app/admin/(protected)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Region = { id: string; nameEn: string };

export function VenueForm({ regions }: { regions: Region[] }) {
  const router = useRouter();
  const [form, setForm] = useState({
    nameEn: "",
    nameAr: "",
    country: "",
    flag: "",
    regionId: regions[0]?.id ?? "",
  });
  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await createVenue({ ...form, sort: 0 });
        setForm({ nameEn: "", nameAr: "", country: "", flag: "", regionId: regions[0]?.id ?? "" });
        router.refresh();
      }}
      className="grid gap-4 sm:grid-cols-2"
    >
      <div>
        <Label>City (EN)</Label>
        <Input value={form.nameEn} onChange={(e) => set("nameEn", e.target.value)} required />
      </div>
      <div>
        <Label>City (AR)</Label>
        <Input dir="rtl" value={form.nameAr} onChange={(e) => set("nameAr", e.target.value)} />
      </div>
      <div>
        <Label>Country</Label>
        <Input value={form.country} onChange={(e) => set("country", e.target.value)} required />
      </div>
      <div>
        <Label>Region</Label>
        <select
          value={form.regionId}
          onChange={(e) => set("regionId", e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          {regions.map((r) => (
            <option key={r.id} value={r.id}>
              {r.nameEn}
            </option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2">
        <Button type="submit">Add Venue</Button>
      </div>
    </form>
  );
}