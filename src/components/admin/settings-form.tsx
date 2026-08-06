"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveSettings } from "@/app/admin/(protected)/actions-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SettingsForm({ initial }: { initial: Record<string, string> }) {
  const router = useRouter();
  const [form, setForm] = useState({
    contact_phone: initial.contact_phone ?? "+971 (04) 425 0700",
    contact_email: initial.contact_email ?? "info@takween.com",
    admin_alert_email: initial.admin_alert_email ?? "",
    brand_name: initial.brand_name ?? "Takween",
    whatsapp_phone: initial.whatsapp_phone ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      await saveSettings(form, { host: "", port: "587", user: "", pass: "", from: "" });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={(e) => e.preventDefault()} className="grid gap-4 sm:grid-cols-2">
      {error && (
        <div className="col-span-full rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}
      <div>
        <Label>Contact Phone</Label>
        <Input value={form.contact_phone} onChange={(e) => set("contact_phone", e.target.value)} />
      </div>
      <div>
        <Label>Contact Email</Label>
        <Input value={form.contact_email} onChange={(e) => set("contact_email", e.target.value)} />
      </div>
      <div>
        <Label>Admin Alert Email</Label>
        <Input value={form.admin_alert_email} onChange={(e) => set("admin_alert_email", e.target.value)} placeholder="receives new signup alerts" />
      </div>
      <div>
        <Label>Brand Name</Label>
        <Input value={form.brand_name} onChange={(e) => set("brand_name", e.target.value)} />
      </div>
      <div>
        <Label>WhatsApp Number</Label>
        <Input value={form.whatsapp_phone} onChange={(e) => set("whatsapp_phone", e.target.value)} placeholder="+971501234567" />
      </div>
      <div className="flex items-end">
        <Button type="button" onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save Contact Info"}
        </Button>
      </div>
    </form>
  );
}