"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { requireAdmin } from "@/lib/require-admin";

// ------------------------------------------------------------------
// Countries
// ------------------------------------------------------------------
const countrySchema = z.object({
  iso: z.string().min(2).max(3).toUpperCase(),
  nameEn: z.string().min(1),
  nameAr: z.string().optional(),
  currency: z.string().optional(),
});

export async function createCountry(data: z.infer<typeof countrySchema>) {
  await requireAdmin();
  const input = countrySchema.parse(data);
  await prisma.country.upsert({
    where: { iso: input.iso },
    update: input,
    create: input,
  });
  revalidatePath("/admin/countries");
}

export async function updateCountry(iso: string, data: z.infer<typeof countrySchema>) {
  await requireAdmin();
  const input = countrySchema.parse(data);
  await prisma.country.update({ where: { iso }, data: input });
  revalidatePath("/admin/countries");
}

export async function deleteCountry(iso: string) {
  await requireAdmin();
  await prisma.country.delete({ where: { iso } });
  revalidatePath("/admin/countries");
}

// ------------------------------------------------------------------
// Regions
// ------------------------------------------------------------------
const regionSchema = z.object({
  slug: z.string().min(1),
  nameEn: z.string().min(1),
  nameAr: z.string().optional(),
  icon: z.string().optional(),
  sort: z.coerce.number().default(0),
});

export async function createRegion(data: z.infer<typeof regionSchema>) {
  await requireAdmin();
  const input = regionSchema.parse(data);
  await prisma.region.create({ data: { ...input, slug: slugify(input.slug) } });
  revalidatePath("/admin/regions");
}

export async function updateRegion(id: string, data: z.infer<typeof regionSchema>) {
  await requireAdmin();
  const input = regionSchema.parse(data);
  await prisma.region.update({
    where: { id },
    data: { ...input, slug: slugify(input.slug) },
  });
  revalidatePath("/admin/regions");
}

export async function deleteRegion(id: string) {
  await requireAdmin();
  await prisma.region.delete({ where: { id } });
  revalidatePath("/admin/regions");
}

const superCategorySchema = z.object({
  slug: z.string().min(1),
  nameEn: z.string().min(1),
  nameAr: z.string().optional(),
  image: z.string().optional(),
  sort: z.coerce.number().default(0),
  featured: z.boolean().default(false),
});

export async function createSuperCategory(data: z.infer<typeof superCategorySchema>) {
  await requireAdmin();
  await prisma.superCategory.create({ data: { ...data, slug: slugify(data.slug) } });
  revalidatePath("/admin/super-categories");
}

export async function updateSuperCategory(id: string, data: z.infer<typeof superCategorySchema>) {
  await requireAdmin();
  await prisma.superCategory.update({ where: { id }, data: { ...data, slug: slugify(data.slug) } });
  revalidatePath("/admin/super-categories");
}

export async function deleteSuperCategory(id: string) {
  await requireAdmin();
  await prisma.superCategory.delete({ where: { id } });
  revalidatePath("/admin/super-categories");
}

// ------------------------------------------------------------------
// Venues
// ------------------------------------------------------------------
const venueSchema = z.object({
  nameEn: z.string().min(1),
  nameAr: z.string().optional(),
  country: z.string().min(1),
  flag: z.string().optional(),
  regionId: z.string().min(1),
  sort: z.coerce.number().default(0),
});

export async function createVenue(data: z.infer<typeof venueSchema>) {
  await requireAdmin();
  const input = venueSchema.parse(data);
  await prisma.venue.create({
    data: { ...input, slug: slugify(`${input.nameEn}-${input.country}`) },
  });
  revalidatePath("/admin/venues");
}

export async function updateVenue(id: string, data: z.infer<typeof venueSchema>) {
  await requireAdmin();
  const input = venueSchema.parse(data);
  await prisma.venue.update({
    where: { id },
    data: { ...input, slug: slugify(`${input.nameEn}-${input.country}`) },
  });
  revalidatePath("/admin/venues");
}

export async function deleteVenue(id: string) {
  await requireAdmin();
  await prisma.schedule.deleteMany({ where: { venueId: id } });
  await prisma.venue.delete({ where: { id } });
  revalidatePath("/admin/venues");
}

// ------------------------------------------------------------------
// Categories
// ------------------------------------------------------------------
const categorySchema = z.object({
  slug: z.string().min(1),
  nameEn: z.string().min(1),
  nameAr: z.string().optional(),
  taglineEn: z.string().optional(),
  taglineAr: z.string().optional(),
  descriptionEn: z.string().optional(),
  descriptionAr: z.string().optional(),
  image: z.string().optional(),
  icon: z.string().optional(),
  sort: z.coerce.number().default(0),
  featured: z.boolean().default(false),
  superCategoryId: z.string().optional(),
});

export async function createCategory(data: z.infer<typeof categorySchema>) {
  await requireAdmin();
  const input = categorySchema.parse(data);
  await prisma.category.create({
    data: { ...input, slug: slugify(input.slug), superCategoryId: input.superCategoryId || null },
  });
  revalidatePath("/admin/categories");
}

export async function updateCategory(id: string, data: z.infer<typeof categorySchema>) {
  await requireAdmin();
  const input = categorySchema.parse(data);
  await prisma.category.update({
    where: { id },
    data: { ...input, slug: slugify(input.slug), superCategoryId: input.superCategoryId || null },
  });
  revalidatePath("/admin/categories");
}

export async function deleteCategory(id: string) {
  await requireAdmin();
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
}

// ------------------------------------------------------------------
// Certificates
// ------------------------------------------------------------------
export async function createCertificate(data: {
  code: string;
  nameEn: string;
  nameAr?: string;
  slug?: string;
  description?: string;
  logo?: string;
  sort?: number;
}) {
  await requireAdmin();
  await prisma.certificate.create({
    data: {
      code: data.code,
      nameEn: data.nameEn,
      nameAr: data.nameAr,
      slug: data.slug || slugify(data.nameEn),
      description: data.description,
      logo: data.logo,
      sort: Number(data.sort ?? 0),
    },
  });
  revalidatePath("/admin/certificates");
}

export async function updateCertificate(id: string, data: {
  code: string;
  nameEn: string;
  nameAr?: string;
  slug?: string;
  description?: string;
  logo?: string;
  sort?: number;
}) {
  await requireAdmin();
  await prisma.certificate.update({
    where: { id },
    data: {
      code: data.code,
      nameEn: data.nameEn,
      nameAr: data.nameAr,
      description: data.description,
      logo: data.logo,
      sort: Number(data.sort ?? 0),
    },
  });
  revalidatePath("/admin/certificates");
}

export async function deleteCertificate(id: string) {
  await requireAdmin();
  await prisma.certificate.delete({ where: { id } });
  revalidatePath("/admin/certificates");
}

export async function linkCertificate(courseId: string, certificateId: string) {
  await requireAdmin();
  await prisma.course.update({
    where: { id: courseId },
    data: { certificates: { connect: { id: certificateId } } },
  });
  revalidatePath("/admin/courses");
  revalidatePath(`/admin/courses/${courseId}`);
}

export async function unlinkCertificate(courseId: string, certificateId: string) {
  await requireAdmin();
  await prisma.course.update({
    where: { id: courseId },
    data: { certificates: { disconnect: { id: certificateId } } },
  });
  revalidatePath("/admin/courses");
  revalidatePath(`/admin/courses/${courseId}`);
}

// ------------------------------------------------------------------
// Testimonials / Articles
// ------------------------------------------------------------------
export async function deleteTestimonial(id: string) {
  await requireAdmin();
  await prisma.testimonial.delete({ where: { id } });
  revalidatePath("/admin/testimonials");
}

const testimonialSchema = z.object({
  textEn: z.string().min(1),
  textAr: z.string().optional(),
  author: z.string().min(1),
  company: z.string().optional(),
  featured: z.boolean().default(false),
  sort: z.coerce.number().default(0),
  courseId: z.string().optional(),
});

export async function createTestimonial(data: z.infer<typeof testimonialSchema>) {
  await requireAdmin();
  await prisma.testimonial.create({ data: { ...data, courseId: data.courseId || null } });
  revalidatePath("/admin/testimonials");
}

export async function updateTestimonial(id: string, data: z.infer<typeof testimonialSchema>) {
  await requireAdmin();
  await prisma.testimonial.update({
    where: { id },
    data: { ...data, courseId: data.courseId || null },
  });
  revalidatePath("/admin/testimonials");
}

const articleSchema = z.object({
  slug: z.string().min(1),
  titleEn: z.string().min(1),
  titleAr: z.string().optional(),
  excerptEn: z.string().optional(),
  excerptAr: z.string().optional(),
  bodyEn: z.string().optional(),
  bodyAr: z.string().optional(),
  status: z.string().default("published"),
});

export async function createArticle(data: z.infer<typeof articleSchema>) {
  await requireAdmin();
  await prisma.article.create({ data: { ...data, slug: slugify(data.slug) } });
  revalidatePath("/admin/articles");
}

export async function updateArticle(id: string, data: z.infer<typeof articleSchema>) {
  await requireAdmin();
  await prisma.article.update({ where: { id }, data: { ...data, slug: slugify(data.slug) } });
  revalidatePath("/admin/articles");
}

export async function deleteArticle(id: string) {
  await requireAdmin();
  await prisma.article.delete({ where: { id } });
  revalidatePath("/admin/articles");
}

// ------------------------------------------------------------------
// Registrations
// ------------------------------------------------------------------
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
  const input = registrationSchema.parse(data);

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

export async function updateRegistrationStatus(id: string, status: string) {
  await requireAdmin();
  await prisma.registration.update({ where: { id }, data: { status } });
  revalidatePath("/admin/submissions");
}

export async function deleteRegistration(id: string) {
  await requireAdmin();
  await prisma.registration.delete({ where: { id } });
  revalidatePath("/admin/submissions");
}

export async function updateRegistrationNote(id: string, adminNote: string) {
  await requireAdmin();
  await prisma.registration.update({ where: { id }, data: { adminNote } });
  revalidatePath("/admin/submissions");
  revalidatePath(`/admin/submissions/${id}`);
}

// ------------------------------------------------------------------
// Settings (SMTP etc.)
// ------------------------------------------------------------------
export async function saveSetting(key: string, value: string) {
  await requireAdmin();
  await prisma.siteSetting.upsert({ where: { key }, update: { value }, create: { key, value } });
  revalidatePath("/admin/settings");
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
}

// ------------------------------------------------------------------
// FAQs
// ------------------------------------------------------------------
const faqSchema = z.object({
  questionEn: z.string().min(1),
  questionAr: z.string().optional(),
  answerEn: z.string().min(1),
  answerAr: z.string().optional(),
  categoryId: z.string().optional(),
  sort: z.coerce.number().int().default(0),
});

export async function createFaq(data: z.infer<typeof faqSchema>) {
  await requireAdmin();
  const input = faqSchema.parse(data);
  let categoryId = input.categoryId;
  if (!categoryId) {
    const first = await prisma.category.findFirst({ orderBy: { sort: "asc" } });
    if (!first) throw new Error("Create a category before adding FAQs");
    categoryId = first.id;
  }
  await prisma.faq.create({ data: { ...input, categoryId } });
  revalidatePath("/admin/faqs");
}

export async function updateFaq(id: string, data: z.infer<typeof faqSchema>) {
  await requireAdmin();
  const input = faqSchema.parse(data);
  const categoryId = input.categoryId || undefined;
  await prisma.faq.update({ where: { id }, data: { ...input, categoryId: categoryId as string | undefined } });
  revalidatePath("/admin/faqs");
}

export async function deleteFaq(id: string) {
  await requireAdmin();
  await prisma.faq.delete({ where: { id } });
  revalidatePath("/admin/faqs");
}

// ------------------------------------------------------------------
// Clients (logos)
// ------------------------------------------------------------------
const clientSchema = z.object({
  nameEn: z.string().min(1),
  logo: z.string().default(""),
  url: z.string().url().optional().or(z.literal("")),
  sort: z.coerce.number().int().default(0),
});

export async function createClient(data: z.infer<typeof clientSchema>) {
  await requireAdmin();
  const input = clientSchema.parse(data);
  await prisma.client.create({ data: input });
  revalidatePath("/admin/clients");
}

export async function updateClient(id: string, data: z.infer<typeof clientSchema>) {
  await requireAdmin();
  const input = clientSchema.parse(data);
  await prisma.client.update({ where: { id }, data: input });
  revalidatePath("/admin/clients");
}

export async function deleteClient(id: string) {
  await requireAdmin();
  await prisma.client.delete({ where: { id } });
  revalidatePath("/admin/clients");
}

// ------------------------------------------------------------------
// Providers / Associations
// ------------------------------------------------------------------
const providerSchema = z.object({
  code: z.string().default(""),
  nameEn: z.string().min(1),
  logo: z.string().optional(),
  url: z.string().url().optional().or(z.literal("")),
  kind: z.string().default("endorsed"),
  courseId: z.string().optional().nullable(),
  sort: z.coerce.number().int().default(0),
});

export async function createProvider(data: z.infer<typeof providerSchema>) {
  await requireAdmin();
  const input = providerSchema.parse(data);
  await prisma.providerAssociation.create({ data: { ...input, courseId: input.courseId || null } });
  revalidatePath("/admin/providers");
}

export async function updateProvider(id: string, data: z.infer<typeof providerSchema>) {
  await requireAdmin();
  const input = providerSchema.parse(data);
  await prisma.providerAssociation.update({ where: { id }, data: { ...input, courseId: input.courseId || null } });
  revalidatePath("/admin/providers");
}

export async function deleteProvider(id: string) {
  await requireAdmin();
  await prisma.providerAssociation.delete({ where: { id } });
  revalidatePath("/admin/providers");
}

// ------------------------------------------------------------------
// Downloads / resources
// ------------------------------------------------------------------
const downloadSchema = z.object({
  titleEn: z.string().min(1),
  titleAr: z.string().optional(),
  fileUrl: z.string().min(1),
  type: z.string().default("catalogue"),
  sort: z.coerce.number().int().default(0),
});

export async function createDownload(data: z.infer<typeof downloadSchema>) {
  await requireAdmin();
  const input = downloadSchema.parse(data);
  await prisma.download.create({ data: input });
  revalidatePath("/admin/downloads");
}

export async function updateDownload(id: string, data: z.infer<typeof downloadSchema>) {
  await requireAdmin();
  const input = downloadSchema.parse(data);
  await prisma.download.update({ where: { id }, data: input });
  revalidatePath("/admin/downloads");
}

export async function deleteDownload(id: string) {
  await requireAdmin();
  await prisma.download.delete({ where: { id } });
  revalidatePath("/admin/downloads");
}