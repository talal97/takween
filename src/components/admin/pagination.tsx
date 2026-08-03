"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export function Pagination({
  page,
  totalPages,
  pageSize,
  total,
}: {
  page: number;
  totalPages: number;
  pageSize: number;
  total: number;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function href(p: number) {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("page", String(p));
    return `${pathname}?${sp.toString()}`;
  }

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between gap-4 border-t pt-4">
      <p className="text-sm text-muted-foreground">
        {from}–{to} of {total}
      </p>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" asChild disabled={page <= 1}>
          <Link href={href(page - 1)}>Previous</Link>
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </span>
        <Button variant="outline" size="sm" asChild disabled={page >= totalPages}>
          <Link href={href(page + 1)}>Next</Link>
        </Button>
      </div>
    </div>
  );
}