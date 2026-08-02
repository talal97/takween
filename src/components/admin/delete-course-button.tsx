"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteCourse } from "@/app/admin/(protected)/course-actions";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export function DeleteCourseButton({ id }: { id: string }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  if (!confirm) {
    return (
      <Button variant="ghost" size="icon" className="ml-1" onClick={() => setConfirm(true)}>
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    );
  }
  return (
    <span className="ml-1 inline-flex gap-2 align-middle">
      <Button
        size="sm"
        variant="destructive"
        onClick={async () => {
          await deleteCourse(id);
          router.push("/admin/courses");
          router.refresh();
        }}
      >
        Delete
      </Button>
      <Button size="sm" variant="outline" onClick={() => setConfirm(false)}>
        Cancel
      </Button>
    </span>
  );
}