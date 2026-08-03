"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Public-facing registration/enquiry submission. Kept out of the admin route
// group so the public site does not depend on protected internals.

const registrationSchema = z.object({
  type: z.string().default("register"),
  courseTitle: z.string().min(1),
  courseCode: z.string().optional(),
  scheduleSummary: z.string().optional(),
  salutation: z.string().optional(),
  fullName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  countryIso: z.string().optional(),
  company: z.string().optional(),
  designation: z.string().optional(),
  message: z.string().optional(),
  paymentMode: z.string().optional(),
  locale: z.string().default("en"),
  captcha: z.string().optional(),
  website: z.string().optional(),
});

export async function submitRegistration(data: z.infer<typeof registrationSchema>) {
  const parsed = registrationSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, error: "invalid", issues: parsed.error.flatten().fieldErrors };
  }
  const input = parsed.data;

  const { cookies } = await import("next/headers");
  const { decryptCaptcha } = await import("@/lib/captcha");

  if (input.website) {
    return { ok: false, error: "spam" }; // honeypot
  }

  const challenge = await cookies().then((c) => c.get("takween_captcha")?.value);
  const expected = challenge ? decryptCaptcha(challenge) : null;
  const answer = input.captcha?.toLowerCase();
  if (!expected || !answer || answer !== expected) {
    return { ok: false, error: "captcha" };
  }

  const recent = await prisma.registration.count({
    where: { email: input.email.toLowerCase(), createdAt: { gte: new Date(Date.now() - 60_000) } },
  });
  if (recent > 3) return { ok: false, error: "too-many" };

  const { captcha: _captcha, website: _website, ...payload } = input;
  await prisma.registration.create({ data: { ...payload, email: input.email.toLowerCase() } });
  await import("next/cache").then(({ revalidatePath }) => revalidatePath("/admin/submissions"));

  const { sendRegistrationEmail, sendAdminAlert } = await import("@/lib/mail");
  await sendRegistrationEmail({
    to: input.email,
    courseTitle: input.courseTitle,
    fullName: input.fullName,
  }).catch(() => {});
  await sendAdminAlert({
    courseTitle: input.courseTitle,
    fullName: input.fullName,
    email: input.email,
    phone: input.phone ?? "",
    company: input.company ?? "",
    jobTitle: input.designation ?? "",
    startDate: input.scheduleSummary ?? "",
    venue: "",
    message: input.message ?? "",
  }).catch(() => {});

  return { ok: true };
}