import { cache } from "react";
import { prisma } from "@/lib/prisma";

export const getSettings = cache(async () => {
  const rows = await prisma.siteSetting.findMany();
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
});