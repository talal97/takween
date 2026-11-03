"use client";

import { useUnsavedChanges } from "./unsaved-changes";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { saveSettings } from "@/app/admin/(protected)/actions-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SettingsForm({ initial }: { initial: Record<string, string> }) {
  const router = useRouter();
  const id = useId();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    contact_phone: initial.contact_phone ?? "+971 (04) 425 0700",
    contact_email: initial.contact_email ?? "info@takween.com",
    admin_alert_email: initial.admin_alert_email ?? "",
    brand_name: initial.brand_name ?? "Takween",
    brand_name_ar: initial.brand_name_ar ?? "تكوين",
    whatsapp_phone: initial.whatsapp_phone ?? initial.contact_whatsapp ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const markSaved = useUnsavedChanges(form);

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      await saveSettings(form, { host: "", port: "587", user: "", pass: "", from: "" });
      markSaved();
      router.refresh();
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); void handleSave(); }} className="grid gap-4 sm:grid-cols-2">
      {error && (
        <div role="alert" className="col-span-full rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}
      {saved && <p role="status" className="col-span-full">Contact information saved.</p>}
      <fieldset disabled={saving} className="col-span-full grid gap-4 sm:grid-cols-2">
      <div>
        <Label htmlFor={`${id}-contact_phone`}> Contact Phone</Label>
        <Input id={`${id}-contact_phone`} value={form.contact_phone} onChange={(e) => set("contact_phone", e.target.value)} />
      </div>
      <div>
        <Label htmlFor={`${id}-contact_email`}> Contact Email</Label>
        <Input id={`${id}-contact_email`} value={form.contact_email} onChange={(e) => set("contact_email", e.target.value)} />
      </div>
      <div>
        <Label htmlFor={`${id}-admin_alert_email`}> Admin Alert Email</Label>
        <Input id={`${id}-admin_alert_email`} value={form.admin_alert_email} onChange={(e) => set("admin_alert_email", e.target.value)} placeholder="receives new signup alerts" />
      </div>
      <div>
        <Label htmlFor={`${id}-brand_name`}> Brand Name — English</Label>
        <Input id={`${id}-brand_name`} value={form.brand_name} onChange={(e) => set("brand_name", e.target.value)} />
      </div>
      <div>
        <Label htmlFor={`${id}-brand_name_ar`}>Brand Name — Arabic</Label>
        <Input id={`${id}-brand_name_ar`} dir="rtl" value={form.brand_name_ar} onChange={(e) => set("brand_name_ar", e.target.value)} />
      </div>
      <div>
        <Label htmlFor={`${id}-whatsapp_phone`}> WhatsApp Number</Label>
        <Input id={`${id}-whatsapp_phone`} value={form.whatsapp_phone} onChange={(e) => set("whatsapp_phone", e.target.value)} placeholder="+971501234567" />
      </div>
      <div className="flex items-end">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save Contact Info"}
        </Button>
      </div>
      </fieldset>
    </form>
  );
}