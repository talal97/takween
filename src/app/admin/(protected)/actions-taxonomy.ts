"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { requireAdmin, revalidateSite } from "./actions-helpers";

const countrySchema = z.object({
  iso: z.string().min(2).max(3).toUpperCase(),
  nameEn: z.string().min(1),
  nameAr: z.string().optional(),
  currency: z.string().optional(),
  flag: z.string().optional(),
});

export async function createCountry(data: z.infer<typeof countrySchema>) {
  await requireAdmin();
  const input = countrySchema.parse(data);
  await prisma.country.upsert({ where: { iso: input.iso }, update: input, create: input });
  revalidatePath("/admin/countries");
  revalidateSite();
}

export async function updateCountry(iso: string, data: z.infer<typeof countrySchema>) {
  await requireAdmin();
  const input = countrySchema.parse(data);
  await prisma.country.update({ where: { iso }, data: input });
  revalidatePath("/admin/countries");
  revalidateSite();
}

export async function deleteCountry(iso: string) {
  await requireAdmin();
  await prisma.country.delete({ where: { iso } });
  revalidatePath("/admin/countries");
  revalidateSite();
}

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
  revalidateSite();
}

export async function updateRegion(id: string, data: z.infer<typeof regionSchema>) {
  await requireAdmin();
  const input = regionSchema.parse(data);
  await prisma.region.update({ where: { id }, data: { ...input, slug: slugify(input.slug) } });
  revalidatePath("/admin/regions");
  revalidateSite();
}

export async function deleteRegion(id: string) {
  await requireAdmin();
  await prisma.region.delete({ where: { id } });
  revalidatePath("/admin/regions");
  revalidateSite();
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
  revalidateSite();
}

export async function updateSuperCategory(id: string, data: z.infer<typeof superCategorySchema>) {
  await requireAdmin();
  await prisma.superCategory.update({ where: { id }, data: { ...data, slug: slugify(data.slug) } });
  revalidatePath("/admin/super-categories");
  revalidateSite();
}

export async function deleteSuperCategory(id: string) {
  await requireAdmin();
  await prisma.superCategory.delete({ where: { id } });
  revalidatePath("/admin/super-categories");
  revalidateSite();
}

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
  revalidateSite();
}

export async function updateVenue(id: string, data: z.infer<typeof venueSchema>) {
  await requireAdmin();
  const input = venueSchema.parse(data);
  await prisma.venue.update({
    where: { id },
    data: { ...input, slug: slugify(`${input.nameEn}-${input.country}`) },
  });
  revalidatePath("/admin/venues");
  revalidateSite();
}

export async function deleteVenue(id: string) {
  await requireAdmin();
  await prisma.schedule.deleteMany({ where: { venueId: id } });
  await prisma.venue.delete({ where: { id } });
  revalidatePath("/admin/venues");
  revalidateSite();
}

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
  revalidateSite();
}

export async function updateCategory(id: string, data: z.infer<typeof categorySchema>) {
  await requireAdmin();
  const input = categorySchema.parse(data);
  await prisma.category.update({
    where: { id },
    data: { ...input, slug: slugify(input.slug), superCategoryId: input.superCategoryId || null },
  });
  revalidatePath("/admin/categories");
  revalidateSite();
}

export async function deleteCategory(id: string) {
  await requireAdmin();
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
  revalidateSite();
}