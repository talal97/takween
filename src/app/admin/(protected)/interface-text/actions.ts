"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin, revalidateSite } from "../actions-helpers";
import { interfaceSettingKey, validateInterfaceText } from "@/lib/interface-text";
import { revalidatePath } from "next/cache";

export async function saveInterfaceText(locale: "en" | "ar", values: Record<string, string>) {
  await requireAdmin();
  if (locale !== "en" && locale !== "ar") throw new Error("Choose English or Arabic.");
  validateInterfaceText(values);
  await prisma.$transaction(Object.entries(values).map(([field, text]) => {
    const key = interfaceSettingKey(locale, field);
    const value = text.trim();
    return prisma.siteSetting.upsert({ where: { key }, update: { value }, create: { key, value } });
  }));
  revalidateSite();
  revalidatePath("/admin/interface-text");
}
