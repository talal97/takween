import nodemailer from "nodemailer";
import { getSettings } from "@/lib/settings";

export async function getTransporter() {
  const s = await getSettings();
  const host = s.smtp_host;
  if (!host) return null;
  return nodemailer.createTransport({
    host,
    port: Number(s.smtp_port || 587),
    secure: Number(s.smtp_port) === 465,
    auth: s.smtp_user ? { user: s.smtp_user, pass: s.smtp_pass } : undefined,
  });
}

export async function sendRegistrationEmail(input: {
  to: string;
  courseTitle: string;
  fullName: string;
}) {
  const transporter = await getTransporter();
  if (!transporter) return;
  const s = await getSettings();
  const from = s.mail_from || s.contact_email || "no-reply@takween.com";

  const text = `Dear ${input.fullName},\n\nThank you for your interest in "${input.courseTitle}".\nWe have received your registration and our team will contact you shortly.\n\nBest regards,\n${s.brand_name || "Takween"} Team`;

  await transporter.sendMail({
    from,
    to: input.to,
    subject: `Registration received: ${input.courseTitle}`,
    text,
  });
}

export async function sendAdminAlert(input: {
  courseTitle: string;
  fullName: string;
  email: string;
  phone: string;
  company: string;
  jobTitle: string;
  startDate: string;
  venue: string;
  message: string;
}) {
  const transporter = await getTransporter();
  if (!transporter) return;
  const s = await getSettings();
  const from = s.mail_from || s.contact_email || "no-reply@takween.com";
  const adminTo = s.contact_email || input.email;

  const text =
    `New training registration received.\n\n` +
    `Course: ${input.courseTitle}\n` +
    `Name: ${input.fullName}\n` +
    `Email: ${input.email}\n` +
    `Phone: ${input.phone || "-"}\n` +
    `Company: ${input.company || "-"}\n` +
    `Job Title: ${input.jobTitle || "-"}\n` +
    `Preferred Start: ${input.startDate || "-"}\n` +
    `Venue: ${input.venue || "-"}\n` +
    `Message: ${input.message || "-"}\n`;

  await transporter.sendMail({
    from,
    to: adminTo,
    subject: `New course enquiry: ${input.courseTitle}`,
    text,
  });
}