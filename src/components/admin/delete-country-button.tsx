"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteCountry } from "@/app/admin/(protected)/actions";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export function DeleteCountryButton({ iso }: { iso: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">Confirm?</span>
      <Button
        size="sm"
        variant="destructive"
        onClick={async () => {
          await deleteCountry(iso);
          router.refresh();
        }}
      >
        Delete
      </Button>
      <Button size="sm" variant="outline" onClick={() => setOpen(false)}>
        Cancel
      </Button>
    </div>
  );
}