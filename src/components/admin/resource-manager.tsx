"use client";

import { confirmDiscardChanges, useUnsavedChanges } from "./unsaved-changes";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { UploadInput } from "@/components/admin/upload-input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type FieldSpec =
  | { key: string; label: string; type: "text" | "textarea" }
  | { key: string; label: string; type: "select"; options: Array<{ value: string; label: string }> }
  | { key: string; label: string; type: "upload"; image?: boolean };

export type RowData = Record<string, string | number>;

export function ResourceManager({
  title,
  describe,
  addLabel,
  fields,
  items,
  onCreate,
  onUpdate,
  onDelete,
  columns,
}: {
  title: string;
  describe?: string;
  addLabel: string;
  fields: FieldSpec[];
  items: RowData[];
  /* eslint-disable @typescript-eslint/no-explicit-any */
  onCreate: (...args: any[]) => Promise<unknown>;
  onUpdate: (...args: any[]) => Promise<unknown>;
  onDelete: (...args: any[]) => Promise<unknown>;
  /* eslint-enable @typescript-eslint/no-explicit-any */
  columns: Array<{
    key: string;
    label: string;
    kind?: "text" | "link" | "image";
    linkKey?: string;
    ar?: boolean;
  }>;
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const defaultValue = (field: FieldSpec) => field.type === "select" ? field.options[0]?.value ?? "" : "";

  const markSaved = useUnsavedChanges(form);

  function reset() {
    markSaved({});
    setEditingId(null);
    setForm({});
  }

  async function startEdit(item: RowData) {
    if (!await confirmDiscardChanges()) return;
    setError("");
    setSaved("");
    setEditingId(item.id as string);
    const f: Record<string, string> = {};
    for (const field of fields) {
      const v = item[field.key];
      f[field.key] = v == null ? "" : String(v);
    }
    markSaved(f);
    setForm(f);
  }

  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  const payload = Object.fromEntries(fields.map((f) => [f.key, form[f.key] ?? defaultValue(f)]));

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="rounded-lg border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((c) => (
                  <TableHead key={c.key}>{c.label}</TableHead>
                ))}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} className="text-center text-muted-foreground">
                    Nothing here yet.
                  </TableCell>
                </TableRow>
              )}
              {items.map((item) => (
                <TableRow key={item.id as string}>
                  {columns.map((c) => <Cell key={c.key} col={c} item={item} />)}
                  <TableCell className="text-right">
                    <div className="inline-flex gap-1">
                      <Button disabled={busy} size="sm" variant="ghost" onClick={() => startEdit(item)} title="Edit" aria-label={`Edit ${title}`}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {confirm === item.id ? (
                        <>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={busy}
                            onClick={async () => {
                              setBusy(true);
                              setError("");
                              setSaved("");
                              try {
                                await onDelete(item.id as string);
                                if (editingId === item.id) reset();
                                setConfirm(null);
                                setSaved(`${title} deleted.`);
                                router.refresh();
                              } catch {
                                setError(`Could not delete this ${title.toLowerCase()}. It may still be used by other content.`);
                              } finally { setBusy(false); }
                            }}
                          >
                            Confirm
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setConfirm(null)}>
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button disabled={busy} size="sm" variant="ghost" className="text-destructive" onClick={() => setConfirm(item.id as string)} title="Delete" aria-label={`Delete ${title}`}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <h3 className="mb-1 font-semibold">{editingId ? `Edit ${title}` : addLabel}</h3>
          {describe && <p className="mb-4 text-xs text-muted-foreground">{describe}</p>}
          <form
            className="grid gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              void (async () => {
                setBusy(true);
                setError("");
                setSaved("");
                try {
                  if (editingId) await onUpdate(editingId, payload);
                  else await onCreate(payload);
                  setSaved(`${title} saved.`);
                  reset();
                  router.refresh();
                } catch (err) {
                  setError(err instanceof Error ? err.message : "An error occurred");
                } finally {
                  setBusy(false);
                }
              })();
            }}
          >
            {error && (
              <div role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
            )}
            {saved && <p role="status" className="text-sm">{saved}</p>}
            <fieldset disabled={busy} className="grid gap-3">
              {fields.map((f) => (
                <FieldInput key={f.key} field={f} value={form[f.key] ?? defaultValue(f)} onChange={(v) => set(f.key, v)} />
              ))}
            </fieldset>
            <div className="flex gap-2 pt-1">
              <Button type="submit" className={cn("flex-1")} disabled={busy}>
                {busy ? "Saving…" : editingId ? "Save changes" : "Add"}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={async () => { if (await confirmDiscardChanges()) reset(); }}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function Cell({
  col,
  item,
}: {
  col: { key: string; label: string; kind?: "text" | "link" | "image"; linkKey?: string; ar?: boolean };
  item: RowData;
}) {
  const raw = item[col.key];
  if (col.kind === "image" && String(raw)) {
    return (
      <TableCell>
        <img src={String(raw)} alt="" className="h-6 max-w-[120px] object-contain" />
      </TableCell>
    );
  }
  if (col.kind === "link" && String(raw)) {
    const link = col.linkKey ? String(item[col.linkKey] ?? "") : String(raw);
    return (
      <TableCell>
        <a href={link} target="_blank" rel="noreferrer" className="text-brand hover:underline">
          Open
        </a>
      </TableCell>
    );
  }
  return <TableCell dir={col.ar ? "rtl" : undefined}>{String(raw ?? "—")}</TableCell>;
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: FieldSpec;
  value: string;
  onChange: (v: string) => void;
}) {
  const id = useId();
  const dir = field.key.endsWith("Ar") ? "rtl" : undefined;
  if (field.type === "upload") {
    return (
      <div>
        <Label htmlFor={id}>{field.label}</Label>
        <div className="space-y-1.5">
          <UploadInput value={value} onChange={onChange} kind={field.image ? "image" : "file"} label={field.label} />
          <input
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="…or paste a URL"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
      </div>
    );
  }
  if (field.type === "select") {
    return (
      <div>
        <Label htmlFor={id}>{field.label}</Label>
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          {!field.options.some((option) => option.value === value) && <option value={value}>{value || "Select…"}</option>}
          {field.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    );
  }
  if (field.type === "textarea") {
    return (
      <div>
        <Label htmlFor={id}>{field.label}</Label>
        <Textarea id={id} dir={dir} value={value} onChange={(e) => onChange(e.target.value)} rows={3} />
      </div>
    );
  }
  return (
    <div>
      <Label htmlFor={id}>{field.label}</Label>
      <Input id={id} dir={dir} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
