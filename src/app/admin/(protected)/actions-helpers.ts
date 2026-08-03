import { revalidateTag } from "next/cache";
import { SITE_TAG } from "@/lib/data";
import { requireAdmin, requireOwner } from "@/lib/require-admin";

// Shared guard + cache invalidation for admin server actions.
export { requireAdmin, requireOwner };

// Every public-facing mutation should also invalidate the site cache so
// static/cached public pages pick up the change immediately.
export function revalidateSite() {
  revalidateTag(SITE_TAG);
}