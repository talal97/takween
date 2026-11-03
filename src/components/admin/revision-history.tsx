"use client";

import { useState } from "react";
import { listRevisions, restoreRevision } from "@/app/admin/(protected)/revision-actions";
import { Button } from "@/components/ui/button";
import { ContentPreview } from "./content-preview";
import { clearUnsavedChanges, confirmDiscardChanges } from "./unsaved-changes";

export function RevisionHistory({ kind, entityId }: { kind: "course" | "article"; entityId: string }) {
  const [rows, setRows] = useState<Awaited<ReturnType<typeof listRevisions>> | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  return <section className="my-5 space-y-3 rounded border p-4">
    <h2 className="font-semibold">Revision history / سجل الإصدارات</h2>
    <p className="text-sm text-muted-foreground">Previous saved versions include both languages. Restoring replaces the current content and website visibility, and keeps a backup. / الاستعادة تشمل اللغتين وإعدادات النشر مع حفظ نسخة احتياطية.</p>
    <Button type="button" disabled={busy} variant="outline" onClick={async () => {
      setBusy(true); setError("");
      try { setRows(await listRevisions(kind, entityId)); } catch { setError("Could not load history. / تعذر تحميل السجل."); }
      finally { setBusy(false); }
    }}>{busy ? "Loading… / جارٍ التحميل" : "Load history / عرض السجل"}</Button>
    {error && <p role="alert" className="text-destructive">{error}</p>}
    {rows?.length === 0 && <p>No previous versions yet. A version is kept whenever this editor saves an update. / لا توجد إصدارات سابقة حتى الآن.</p>}
    {rows && rows.length > 0 && <p className="text-sm">Showing the latest {rows.length} versions (up to 50). / أحدث الإصدارات</p>}
    {rows?.map((row) => <div key={row.id} role="group" aria-label={`Revision ${row.createdAt} ${row.actor}`} className="flex flex-wrap items-center gap-3 rounded bg-muted p-3">
      <span>{new Date(row.createdAt).toLocaleString()} · {row.actor}</span>
      <span className="text-sm">{String(row.snapshot.titleEn || row.snapshot.titleAr || "Untitled")} · {String(row.snapshot.locale)}{kind === "article" ? ` · ${String(row.snapshot.status)}` : ""}</span>
      <ContentPreview kind={kind} data={row.snapshot} label="Review version / معاينة الإصدار" />
      {selected === row.id ? <>
        <span>Replace current content? / استبدال المحتوى الحالي؟</span>
        {kind === "article" && row.snapshot.status === "published" && <p role="alert" className="w-full text-sm">This version is published. Restoring it makes the article public on its selected websites. / هذا الإصدار منشور. استعادته ستنشر المقال على المواقع المحددة.</p>}
        <Button type="button" disabled={busy} onClick={async () => {
          if (!await confirmDiscardChanges(false)) return;
          setBusy(true); setError("");
          try {
            await restoreRevision(kind, entityId, row.id);
            clearUnsavedChanges();
            window.location.reload();
          } catch { setError("Restore failed. Nothing was changed. A linked category, venue, or certificate may have been deleted. / تعذرت الاستعادة ولم يتم تغيير المحتوى."); setBusy(false); }
        }}>Confirm restore / تأكيد الاستعادة</Button>
        <Button type="button" variant="outline" disabled={busy} onClick={() => setSelected(null)}>Cancel / إلغاء</Button>
      </> : <Button type="button" variant="outline" disabled={busy} onClick={() => setSelected(row.id)}>Restore / استعادة</Button>}
    </div>)}
  </section>;
}
