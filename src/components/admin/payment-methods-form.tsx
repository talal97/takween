"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveSetting } from "@/app/admin/(protected)/actions-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, GripVertical } from "lucide-react";

export type PaymentMethod = {
  id: string;
  label_en: string;
  label_ar: string;
  enabled: boolean;
};

const DEFAULT_METHODS: PaymentMethod[] = [
  { id: "invoice-me", label_en: "Invoice Me", label_ar: "فاتورة شخصية", enabled: true },
  { id: "invoice-company", label_en: "Invoice Company", label_ar: "فاتورة الشركة", enabled: true },
];

function parseMethods(raw: string | undefined): PaymentMethod[] {
  if (!raw) return DEFAULT_METHODS;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    return DEFAULT_METHODS;
  } catch {
    return DEFAULT_METHODS;
  }
}

export function PaymentMethodsForm({ initial }: { initial: Record<string, string> }) {
  const router = useRouter();
  const [methods, setMethods] = useState<PaymentMethod[]>(() => parseMethods(initial.payment_methods));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function addMethod() {
    const id = `method-${Date.now()}`;
    setMethods((prev) => [...prev, { id, label_en: "", label_ar: "", enabled: true }]);
  }

  function removeMethod(id: string) {
    setMethods((prev) => prev.filter((m) => m.id !== id));
  }

  function updateMethod(id: string, field: keyof PaymentMethod, value: string | boolean) {
    setMethods((prev) => prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const filtered = methods.filter((m) => m.label_en.trim());
      await saveSetting("payment_methods", JSON.stringify(filtered));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Configure the payment options shown on the registration form. Disabled options won&apos;t appear for users.
      </p>
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}
      <div className="space-y-3">
        {methods.map((m) => (
          <div key={m.id} className="flex items-start gap-3 rounded-lg border p-3">
            <div className="mt-2 cursor-grab text-muted-foreground">
              <GripVertical size={14} />
            </div>
            <div className="grid flex-1 grid-cols-2 gap-2">
              <div className="grid gap-1">
                <Label className="text-xs">ID (slug)</Label>
                <Input
                  value={m.id}
                  onChange={(e) => updateMethod(m.id, "id", e.target.value)}
                  className="h-8 text-xs"
                  placeholder="invoice-me"
                />
              </div>
              <div className="grid gap-1">
                <Label className="text-xs">Enabled</Label>
                <button
                  type="button"
                  onClick={() => updateMethod(m.id, "enabled", !m.enabled)}
                  className={`flex h-8 items-center rounded-md border px-3 text-xs font-medium transition-colors ${
                    m.enabled
                      ? "border-green-300 bg-green-50 text-green-700"
                      : "border-muted bg-muted text-muted-foreground"
                  }`}
                >
                  {m.enabled ? "Enabled" : "Disabled"}
                </button>
              </div>
              <div className="grid gap-1">
                <Label className="text-xs">Label (EN)</Label>
                <Input
                  value={m.label_en}
                  onChange={(e) => updateMethod(m.id, "label_en", e.target.value)}
                  className="h-8 text-xs"
                  placeholder="Invoice Me"
                />
              </div>
              <div className="grid gap-1">
                <Label className="text-xs">Label (AR)</Label>
                <Input
                  value={m.label_ar}
                  onChange={(e) => updateMethod(m.id, "label_ar", e.target.value)}
                  className="h-8 text-xs"
                  placeholder="فاتورة شخصية"
                  dir="rtl"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeMethod(m.id)}
              className="mt-2 rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <Button type="button" variant="outline" size="sm" onClick={addMethod}>
          <Plus size={14} className="mr-1" /> Add Payment Method
        </Button>
        <Button type="button" size="sm" onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save Payment Methods"}
        </Button>
      </div>
    </div>
  );
}
