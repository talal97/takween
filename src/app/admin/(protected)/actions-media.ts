"use server";

import { unlink } from "fs/promises";
import { requireAdmin } from "./actions-helpers";
import { safeJoin } from "@/lib/uploads";

export async function deleteMediaFile(filename: string) {
  await requireAdmin();
  const full = safeJoin(filename);
  if (!full) throw new Error("Invalid filename");
  await unlink(full);
  return { ok: true };
}
