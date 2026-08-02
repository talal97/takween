"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateRegistrationNote } from "@/app/admin/(protected)/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function AdminNoteForm({ id, note }: { id: string; note: string }) {
  const router = useRouter();
  const [value, setValue] = useState(note);
  const [saved, setSaved] = useState(false);

  return (
    <form
      className="space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        void (async () => {
          await updateRegistrationNote(id, value);
          setSaved(true);
          router.refresh();
          setTimeout(() => setSaved(false), 1500);
        })();
      }}
    >
      <Textarea value={value} onChange={(e) => setValue(e.target.value)} rows={4} placeholder="Private notes for your team (not visible to the visitor)…" />
      <div className="flex items-center gap-3">
        <Button type="submit">Save note</Button>
        {saved && <span className="text-sm text-green-600">Saved</span>}
      </div>
    </form>
  );
}