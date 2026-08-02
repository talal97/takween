"use client";

import { useRouter } from "next/navigation";
import { updateRegistrationStatus } from "@/app/admin/(protected)/actions";
import { Button } from "@/components/ui/button";

export function StatusButton({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const next = status === "new" ? "contacted" : "new";
  return (
    <Button
      size="sm"
      variant="outline"
      className="mr-2"
      onClick={async () => {
        await updateRegistrationStatus(id, next);
        router.refresh();
      }}
    >
      Mark {next === "contacted" ? "Contacted" : "New"}
    </Button>
  );
}