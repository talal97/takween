import { cache } from "react";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { SITE_TAG } from "@/lib/data";

export const getSettings = cache(async () => {
  const rows = await prisma.siteSetting.findMany();
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
});

export const getSettingsCached = unstable_cache(getSettings, ["settings"], {
  revalidate: 300,
  tags: [SITE_TAG],
});