"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, revalidateSite } from "./actions-helpers";

// ------------------------------------------------------------------
// Registrations (admin management)
// Note: the public submitRegistration action lives in
// src/lib/actions/registration.ts so the site does not depend on the
// admin route group.
// ------------------------------------------------------------------
export async function updateRegistrationStatus(id: string, status: string) {
  await requireAdmin();
  await prisma.registration.update({ where: { id }, data: { status } });
  revalidatePath("/admin/submissions");
  revalidateSite();
}

export async function deleteRegistration(id: string) {
  await requireAdmin();
  await prisma.registration.delete({ where: { id } });
  revalidatePath("/admin/submissions");
  revalidateSite();
}

export async function updateRegistrationNote(id: string, adminNote: string) {
  await requireAdmin();
  await prisma.registration.update({ where: { id }, data: { adminNote } });
  revalidatePath("/admin/submissions");
  revalidateSite();
  revalidatePath(`/admin/submissions/${id}`);
  revalidateSite();
}

// ------------------------------------------------------------------
// Settings (SMTP etc.)
// ------------------------------------------------------------------
export async function testSmtp(smtp: { host: string; port: string; user: string; pass: string; from: string }) {
  await requireAdmin();
  const nodemailer = (await import("nodemailer")).default;
  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: Number(smtp.port),
    auth: smtp.user ? { user: smtp.user, pass: smtp.pass } : undefined,
  });
  await transporter.sendMail({
    from: smtp.from,
    to: smtp.user || smtp.from,
    subject: "Takween SMTP Test",
    text: "SMTP configuration is working correctly.",
  });
  return { ok: true };
}

export async function saveSetting(key: string, value: string) {
  await requireAdmin();
  await prisma.siteSetting.upsert({ where: { key }, update: { value }, create: { key, value } });
  revalidatePath("/admin/settings");
  revalidateSite();
}

export async function saveSettings(
  settings: Record<string, string>,
  smtp: { host: string; port: string; user: string; pass: string; from: string }
) {
  await requireAdmin();
  const all: Record<string, string> = { ...settings };
  if (smtp.host) {
    all.smtp_host = smtp.host;
    if (smtp.port) all.smtp_port = smtp.port;
    if (smtp.user) all.smtp_user = smtp.user;
    if (smtp.pass) all.smtp_pass = smtp.pass;
    if (smtp.from) all.mail_from = smtp.from;
  }
  for (const [k, v] of Object.entries(all)) {
    await prisma.siteSetting.upsert({ where: { key: k }, update: { value: String(v) }, create: { key: k, value: String(v) } });
  }
  revalidatePath("/admin/settings");
  revalidateSite();
}