"use client";

import { useUnsavedChanges } from "./unsaved-changes";
import { useId, useState } from "react";
import { interfaceFields, interfaceGroups, interfaceSettingKey } from "@/lib/interface-text";
import { saveInterfaceText } from "@/app/admin/(protected)/interface-text/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const groupNames = { navigation: "Navigation menus", common: "Buttons and shared labels", course: "Course section headings", form: "Registration form" };

export function InterfaceTextForm({ initial }: { initial: Record<string, string> }) {
  const id = useId();
  const [locale, setLocale] = useState<"en" | "ar">("en");
  const [group, setGroup] = useState<string>("navigation");
  const [search, setSearch] = useState("");
  const [values, setValues] = useState(initial);
  const [dirty, setDirty] = useState<Record<string, string>>({});
  useUnsavedChanges(Object.keys(dirty).length > 0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const visible = interfaceFields.filter((field) => (group === "all" || field.group === group) && `${field.en} ${field.ar}`.toLowerCase().includes(search.toLowerCase()));
  const pending = Object.keys(dirty).filter((key) => key.startsWith(`interface_${locale}_`));
  return <form className="space-y-5" onSubmit={async (event) => {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      const changes = Object.fromEntries(pending.map((key) => [key.slice(`interface_${locale}_`.length), dirty[key]]));
      await saveInterfaceText(locale, changes);
      setDirty((current) => Object.fromEntries(Object.entries(current).filter(([key]) => !pending.includes(key))));
      setMessage(`${locale === "en" ? "English" : "Arabic"} text saved. The other language is unchanged.`);
    } catch (error) { setError(error instanceof Error ? error.message : "Could not save text."); }
    finally { setBusy(false); }
  }}>
    <p className="text-sm text-muted-foreground">Leave a field blank to use its default. These settings change wording, not link destinations or page layout. Save each language separately; switching language keeps unsaved edits.</p>
    {message && <p role="status">{message}</p>}
    {error && <p role="alert" className="text-destructive">{error}</p>}
    <fieldset disabled={busy} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <div><Label htmlFor={`${id}-language`}>Editing language</Label><select id={`${id}-language`} className="block w-full rounded border p-2" value={locale} onChange={(e) => { setLocale(e.target.value as "en" | "ar"); setMessage(""); }}><option value="en">English</option><option value="ar">Arabic</option></select></div>
        <div><Label htmlFor={`${id}-group`}>Section</Label><select id={`${id}-group`} className="block w-full rounded border p-2" value={group} onChange={(e) => setGroup(e.target.value)}><option value="all">All sections</option>{interfaceGroups.map((value) => <option key={value} value={value}>{groupNames[value]}</option>)}</select></div>
        <div><Label htmlFor={`${id}-search`}>Find text</Label><Input id={`${id}-search`} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search English or Arabic" /></div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">{visible.map((field) => {
        const key = interfaceSettingKey(locale, field.key);
        return <div key={key} className="rounded border bg-card p-4">
          <Label htmlFor={`${id}-${key}`}>{field.en}</Label>
          <Input id={`${id}-${key}`} dir={locale === "ar" ? "rtl" : "ltr"} value={values[key] ?? ""} maxLength={500} placeholder={field[locale]} aria-describedby={`${id}-${key}-default`} onChange={(event) => { const value = event.target.value; setValues((state) => ({ ...state, [key]: value })); setDirty((state) => ({ ...state, [key]: value })); setMessage(""); }} />
          <p id={`${id}-${key}-default`} className="mt-2 text-xs text-muted-foreground">Default: <span dir={locale === "ar" ? "rtl" : "ltr"}>{field[locale]}</span></p>
        </div>;
      })}</div>
      {visible.length === 0 && <p>No matching labels. Try another section or search.</p>}
      <div className="sticky bottom-0 flex flex-wrap items-center gap-3 rounded border bg-background p-3">
        <Button disabled={busy || pending.length === 0} type="submit">{busy ? "Saving…" : `Save ${locale === "en" ? "English" : "Arabic"} text`}</Button>
        <span className="text-sm text-muted-foreground">{pending.length} unsaved changes in this language</span>
      </div>
    </fieldset>
  </form>;
}
