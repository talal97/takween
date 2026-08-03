"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { requireAdmin, revalidateSite } from "./actions-helpers";

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
  revalidateSite();
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
  revalidateSite();
}

export async function deleteCertificate(id: string) {
  await requireAdmin();
  await prisma.certificate.delete({ where: { id } });
  revalidatePath("/admin/certificates");
  revalidateSite();
}

export async function linkCertificate(courseId: string, certificateId: string) {
  await requireAdmin();
  await prisma.course.update({
    where: { id: courseId },
    data: { certificates: { connect: { id: certificateId } } },
  });
  revalidatePath("/admin/courses");
  revalidateSite();
  revalidatePath(`/admin/courses/${courseId}`);
  revalidateSite();
}

export async function unlinkCertificate(courseId: string, certificateId: string) {
  await requireAdmin();
  await prisma.course.update({
    where: { id: courseId },
    data: { certificates: { disconnect: { id: certificateId } } },
  });
  revalidatePath("/admin/courses");
  revalidateSite();
  revalidatePath(`/admin/courses/${courseId}`);
  revalidateSite();
}

// ------------------------------------------------------------------
// Testimonials
// ------------------------------------------------------------------
export async function deleteTestimonial(id: string) {
  await requireAdmin();
  await prisma.testimonial.delete({ where: { id } });
  revalidatePath("/admin/testimonials");
  revalidateSite();
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
  revalidateSite();
}

export async function updateTestimonial(id: string, data: z.infer<typeof testimonialSchema>) {
  await requireAdmin();
  await prisma.testimonial.update({
    where: { id },
    data: { ...data, courseId: data.courseId || null },
  });
  revalidatePath("/admin/testimonials");
  revalidateSite();
}

// ------------------------------------------------------------------
// Articles
// ------------------------------------------------------------------
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
  revalidateSite();
}

export async function updateArticle(id: string, data: z.infer<typeof articleSchema>) {
  await requireAdmin();
  await prisma.article.update({ where: { id }, data: { ...data, slug: slugify(data.slug) } });
  revalidatePath("/admin/articles");
  revalidateSite();
}

export async function deleteArticle(id: string) {
  await requireAdmin();
  await prisma.article.delete({ where: { id } });
  revalidatePath("/admin/articles");
  revalidateSite();
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
  revalidateSite();
}

export async function updateFaq(id: string, data: z.infer<typeof faqSchema>) {
  await requireAdmin();
  const input = faqSchema.parse(data);
  const categoryId = input.categoryId || undefined;
  await prisma.faq.update({ where: { id }, data: { ...input, categoryId: categoryId as string | undefined } });
  revalidatePath("/admin/faqs");
  revalidateSite();
}

export async function deleteFaq(id: string) {
  await requireAdmin();
  await prisma.faq.delete({ where: { id } });
  revalidatePath("/admin/faqs");
  revalidateSite();
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
  revalidateSite();
}

export async function updateClient(id: string, data: z.infer<typeof clientSchema>) {
  await requireAdmin();
  const input = clientSchema.parse(data);
  await prisma.client.update({ where: { id }, data: input });
  revalidatePath("/admin/clients");
  revalidateSite();
}

export async function deleteClient(id: string) {
  await requireAdmin();
  await prisma.client.delete({ where: { id } });
  revalidatePath("/admin/clients");
  revalidateSite();
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
  revalidateSite();
}

export async function updateProvider(id: string, data: z.infer<typeof providerSchema>) {
  await requireAdmin();
  const input = providerSchema.parse(data);
  await prisma.providerAssociation.update({ where: { id }, data: { ...input, courseId: input.courseId || null } });
  revalidatePath("/admin/providers");
  revalidateSite();
}

export async function deleteProvider(id: string) {
  await requireAdmin();
  await prisma.providerAssociation.delete({ where: { id } });
  revalidatePath("/admin/providers");
  revalidateSite();
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
  revalidateSite();
}

export async function updateDownload(id: string, data: z.infer<typeof downloadSchema>) {
  await requireAdmin();
  const input = downloadSchema.parse(data);
  await prisma.download.update({ where: { id }, data: input });
  revalidatePath("/admin/downloads");
  revalidateSite();
}

export async function deleteDownload(id: string) {
  await requireAdmin();
  await prisma.download.delete({ where: { id } });
  revalidatePath("/admin/downloads");
  revalidateSite();
}