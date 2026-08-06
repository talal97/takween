"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveSettings } from "@/app/admin/(protected)/actions-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const COLS: Array<{ key: string; label: string; def: string }> = [
  { key: "color_brand", label: "Brand / Primary", def: "#026481" },
  { key: "color_brand_dark", label: "Brand Dark", def: "#014a61" },
  { key: "color_brand_light", label: "Brand Light bg", def: "#e6f0f4" },
  { key: "color_navy", label: "Navy", def: "#0e2a45" },
  { key: "color_gold", label: "Gold / Accent", def: "#f5a623" },
  { key: "color_background", label: "Page Background", def: "#ffffff" },
  { key: "color_foreground", label: "Text (foreground)", def: "#1f1f1f" },
  { key: "color_ring", label: "Focus Ring", def: "#003366" },
];

const LOCALE: Array<{ key: string; label: string }> = [
  { key: "color_brand", label: "Brand" },
  { key: "color_navy", label: "Navy" },
  { key: "color_gold", label: "Gold" },
];

export function ThemeForm({ initial }: { initial: Record<string, string> }) {
  const router = useRouter();
  const [form, setForm] = useState<Record<string, string>>(() => {
    const base: Record<string, string> = {};
    for (const c of COLS) base[c.key] = initial[c.key] ?? "";
    for (const loc of ["en", "ar"] as const) {
      for (const l of LOCALE) base[`${l.key}_${loc}`] = initial[`${l.key}_${loc}`] ?? "";
    }
    return base;
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function setValue(k: string, v: string) {
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
    <div className="space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}
      <div>
        <h4 className="mb-2 text-sm font-semibold text-muted-foreground">Global (applies to whole site)</h4>
        <div className="grid gap-2.5">
          <SectionRow values={form} setValue={setValue} />
        </div>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <h4 className="mb-2 text-sm font-semibold text-muted-foreground">English site overrides</h4>
          <div className="grid gap-2.5">
            <LocaleRow loc="en" values={form} setValue={setValue} />
          </div>
        </div>
        <div>
          <h4 className="mb-2 text-sm font-semibold text-muted-foreground">Arabic site overrides</h4>
          <div className="grid gap-2.5">
            <LocaleRow loc="ar" values={form} setValue={setValue} />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button
          type="button"
          disabled={saving}
          onClick={handleSave}
        >
          {saving ? "Saving…" : "Save Colors"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            const defaults: typeof form = {};
            for (const c of COLS) defaults[c.key] = c.def;
            setForm((f) => ({ ...f, ...defaults }));
          }}
        >
          Reset Global
        </Button>
      </div>
    </div>
  );
}

function SectionRow({ values, setValue }: { values: Record<string, string>; setValue: (k: string, v: string) => void }) {
  return (
    <>
      {COLS.map((c) => (
        <div key={c.key} className="flex items-center gap-3">
          <input
            type="color"
            value={/^#[0-9a-fA-F]{6}$/.test(values[c.key]) ? values[c.key] : c.def}
            onChange={(e) => setValue(c.key, e.target.value)}
            className="h-9 w-12 cursor-pointer rounded border bg-white"
          />
          <Label className="w-52 shrink-0 text-sm">{c.label}</Label>
          <Input value={values[c.key] ?? c.def} onChange={(e) => setValue(c.key, e.target.value)} className="font-mono" />
        </div>
      ))}
    </>
  );
}

function LocaleRow({
  loc,
  values,
  setValue,
}: {
  loc: string;
  values: Record<string, string>;
  setValue: (k: string, v: string) => void;
}) {
  return (
    <>
      {LOCALE.map((c) => {
        const key = `${c.key}_${loc}`;
        return (
          <div key={key} className="flex items-center gap-3">
            <input
              type="color"
              value={/^#[0-9a-fA-F]{6}$/.test(values[key]) ? values[key] : "#000000"}
              onChange={(e) => setValue(key, e.target.value)}
              className="h-9 w-12 cursor-pointer rounded border bg-white"
            />
            <Label className="w-24 shrink-0 text-sm">{c.label}</Label>
            <Input value={values[key]} onChange={(e) => setValue(key, e.target.value)} placeholder="default" className="font-mono" />
          </div>
        );
      })}
    </>
  );
}