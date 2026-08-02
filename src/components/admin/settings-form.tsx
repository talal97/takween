"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveSettings } from "@/app/admin/(protected)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SettingsForm({ initial }: { initial: Record<string, string> }) {
  const router = useRouter();
  const [form, setForm] = useState({
    contact_phone: initial.contact_phone ?? "+971 (04) 425 0700",
    contact_email: initial.contact_email ?? "info@takween.com",
    brand_name: initial.brand_name ?? "Takween",
  });
  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  return (
    <form onSubmit={(e) => e.preventDefault()} className="grid gap-4 sm:grid-cols-2">
      <div>
        <Label>Contact Phone</Label>
        <Input value={form.contact_phone} onChange={(e) => set("contact_phone", e.target.value)} />
      </div>
      <div>
        <Label>Contact Email</Label>
        <Input value={form.contact_email} onChange={(e) => set("contact_email", e.target.value)} />
      </div>
      <div>
        <Label>Brand Name</Label>
        <Input value={form.brand_name} onChange={(e) => set("brand_name", e.target.value)} />
      </div>
      <div className="flex items-end">
        <Button
          type="button"
          onClick={async () => {
            await saveSettings(form, { host: "", port: "587", user: "", pass: "", from: "" });
            router.refresh();
          }}
        >
          Save Contact Info
        </Button>
      </div>
    </form>
  );
}