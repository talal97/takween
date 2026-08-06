import nodemailer from "nodemailer";
import { getSettings } from "@/lib/settings";
import { buildEmail, type EmailInput, type SubmissionType } from "@/lib/emails/templates";

export function isSmtpEnvManaged() {
  return !!process.env.SMTP_HOST;
}

export async function getTransporter() {
  const host = process.env.SMTP_HOST;
  if (host) {
    return nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT || 587) === 465,
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS || "" } : undefined,
    });
  }
  const s = await getSettings();
  const dbHost = s.smtp_host;
  if (!dbHost) return null;
  return nodemailer.createTransport({
    host: dbHost,
    port: Number(s.smtp_port || 587),
    secure: Number(s.smtp_port) === 465,
    auth: s.smtp_user ? { user: s.smtp_user, pass: s.smtp_pass } : undefined,
  });
}

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://takween.com").replace(/\/$/, "");
}

export async function sendEmail(
  input: EmailInput,
  audience: "customer" | "admin",
  to: string,
): Promise<boolean> {
  const transporter = await getTransporter();
  if (!transporter) return false;
  const s = await getSettings();
  const from = s.mail_from || s.contact_email || "no-reply@takween.com";

  const { subject, html, text } = buildEmail(input, audience);
  try {
    await transporter.sendMail({ from, to, subject, html, text });
    return true;
  } catch (err) {
    console.error(`[mail] failed to send ${audience} email (${input.type}):`, err);
    return false;
  }
}

export async function sendRegistrationEmail(input: {
  type?: SubmissionType;
  locale?: "en" | "ar";
  to: string;
  courseTitle: string;
  courseCode?: string;
  fullName: string;
  email?: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  country?: string;
  startDate?: string;
  endDate?: string;
  venue?: string;
  fee?: string;
  currency?: string;
  format?: string;
  paymentMode?: string;
  message?: string;
  scheduleSummary?: string;
}) {
  const s = await getSettings();
  const brand = s.brand_name || "Takween";
  const type = input.type || "register";
  const locale = input.locale || "en";
  const common: EmailInput = {
    type,
    locale,
    brand,
    tagline: locale === "ar" ? "التدريب والتطوير المهني" : "Training & Professional Development",
    fullName: input.fullName,
    courseTitle: input.courseTitle,
    courseCode: input.courseCode,
    email: input.email,
    phone: input.phone,
    company: input.company,
    designation: input.jobTitle,
    country: input.country,
    venue: input.venue,
    startDate: input.startDate,
    endDate: input.endDate,
    fee: input.fee,
    currency: input.currency,
    format: input.format,
    paymentMode: input.paymentMode,
    message: input.message,
    scheduleSummary: input.scheduleSummary,
    siteUrl: siteUrl(),
  };
  await sendEmail(common, "customer", input.to);
}

export async function sendAdminAlert(input: {
  type?: SubmissionType;
  locale?: "en" | "ar";
  courseTitle: string;
  courseCode?: string;
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  startDate?: string;
  endDate?: string;
  venue?: string;
  fee?: string;
  currency?: string;
  format?: string;
  paymentMode?: string;
  message?: string;
  scheduleSummary?: string;
  country?: string;
}) {
  const s = await getSettings();
  const brand = s.brand_name || "Takween";
  const type = input.type || "register";
  const locale = input.locale || "en";
  const adminTo = s.admin_alert_email || s.contact_email || input.email;

  await sendEmail(
    {
      type,
      locale,
      brand,
      tagline: locale === "ar" ? "التدريب والتطوير المهني" : "Training & Professional Development",
      fullName: input.fullName,
      courseTitle: input.courseTitle,
      courseCode: input.courseCode,
      email: input.email,
      phone: input.phone,
      company: input.company,
      designation: input.jobTitle,
      country: input.country,
      venue: input.venue,
      startDate: input.startDate,
      endDate: input.endDate,
      fee: input.fee,
      currency: input.currency,
      format: input.format,
      paymentMode: input.paymentMode,
      message: input.message,
      scheduleSummary: input.scheduleSummary,
      adminUrl: `${siteUrl()}/admin/submissions`,
    },
    "admin",
    adminTo,
  );
}
