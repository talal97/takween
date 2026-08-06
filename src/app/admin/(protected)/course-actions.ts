"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { slugify } from "@/lib/slug";
import { SITE_TAG } from "@/lib/data";

function revalidateSite() {
  revalidateTag(SITE_TAG);
}

const scheduleSchema = z.object({
  venueId: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  fee: z.coerce.number().default(5950),
  currency: z.string().default("USD"),
  format: z.string().default("classroom"),
});

const daySchema = z.object({
  day: z.coerce.number(),
  title: z.string(),
  topics: z.array(z.string()),
});

const courseSchema = z.object({
  code: z.string().optional(),
  slug: z.string().min(1),
  locale: z.enum(["en", "ar", "both"]).default("both"),
  image: z.string().optional(),
  titleEn: z.string().optional(),
  titleAr: z.string().optional(),
  subtitleEn: z.string().optional(),
  subtitleAr: z.string().optional(),
  badgeEn: z.string().optional(),
  badgeAr: z.string().optional(),
  durationDays: z.coerce.number().default(5),
  categoryId: z.string().min(1),
  featured: z.boolean().default(false),
  introEn: z.string().optional(),
  introAr: z.string().optional(),
  objectivesEn: z.string().optional(),
  objectivesAr: z.string().optional(),
  methodologyEn: z.string().optional(),
  methodologyAr: z.string().optional(),
  orgImpactEn: z.string().optional(),
  orgImpactAr: z.string().optional(),
  personalImpactEn: z.string().optional(),
  personalImpactAr: z.string().optional(),
  targetAudienceEn: z.string().optional(),
  targetAudienceAr: z.string().optional(),
  certificateNoteEn: z.string().optional(),
  certificateNoteAr: z.string().optional(),
  seoTitleEn: z.string().optional(),
  seoTitleAr: z.string().optional(),
});

export async function createCourse(
  data: z.infer<typeof courseSchema>,
  schedules: z.infer<typeof scheduleSchema>[],
  days: z.infer<typeof daySchema>[],
  certificateIds: string[],
  relatedIds: string[]
) {
  await requireAdmin();
  const input = courseSchema.parse(data);
  const out = await prisma.course.create({
    data: {
      code: input.code || "",
      slug: slugify(input.slug),
      locale: input.locale,
      titleEn: input.titleEn,
      titleAr: input.titleAr,
      subtitleEn: input.subtitleEn,
      subtitleAr: input.subtitleAr,
      badgeEn: input.badgeEn,
      badgeAr: input.badgeAr,
      durationDays: input.durationDays,
      image: input.image,
      categoryId: input.categoryId,
      featured: input.featured,
      introEn: input.introEn,
      introAr: input.introAr,
      objectivesEn: input.objectivesEn,
      objectivesAr: input.objectivesAr,
      methodologyEn: input.methodologyEn,
      methodologyAr: input.methodologyAr,
      orgImpactEn: input.orgImpactEn,
      orgImpactAr: input.orgImpactAr,
      personalImpactEn: input.personalImpactEn,
      personalImpactAr: input.personalImpactAr,
      targetAudienceEn: input.targetAudienceEn,
      targetAudienceAr: input.targetAudienceAr,
      certificateNoteEn: input.certificateNoteEn,
      certificateNoteAr: input.certificateNoteAr,
      seoTitleEn: input.seoTitleEn,
      seoTitleAr: input.seoTitleAr,
      dayOutlineEn: days.filter((d) => d.title).map((d) => ({ day: d.day, title: d.title, topics: d.topics })),
      certificates:
        certificateIds.length > 0 ? { connect: certificateIds.map((id) => ({ id })) } : undefined,
      relatedAsSource:
        relatedIds.length > 0 ? { create: relatedIds.map((id) => ({ relatedId: id })) } : undefined,
      schedules: schedules.length > 0
        ? { create: schedules.filter((s) => s.startDate).map((s) => ({ ...s, startDate: new Date(s.startDate), endDate: new Date(s.endDate) })) }
        : undefined,
    },
  });
  revalidatePath("/admin/courses");
  revalidateSite();
  return out.id;
}

export async function updateCourse(
  id: string,
  data: z.infer<typeof courseSchema>,
  schedules: z.infer<typeof scheduleSchema>[],
  days: z.infer<typeof daySchema>[],
  certificateIds: string[],
  relatedIds: string[]
) {
  await requireAdmin();
  const input = courseSchema.parse(data);

  await prisma.$transaction(async (tx) => {
    await tx.schedule.deleteMany({ where: { courseId: id } });
    await tx.courseRelation.deleteMany({ where: { courseId: id } });
    await tx.course.update({
      where: { id },
      data: {
        ...input,
        slug: slugify(input.slug),
        dayOutlineEn: days.filter((d) => d.title).map((d) => ({ day: d.day, title: d.title, topics: d.topics })),
        certificates: certificateIds.length > 0 ? { set: certificateIds.map((cid) => ({ id: cid })) } : { set: [] },
        relatedAsSource:
          relatedIds.length > 0 ? { create: relatedIds.map((rid) => ({ relatedId: rid })) } : undefined,
        schedules: {
          create: schedules.filter((s) => s.startDate).map((s) => ({
            venueId: s.venueId,
            startDate: new Date(s.startDate),
            endDate: new Date(s.endDate),
            fee: s.fee,
            currency: s.currency,
            format: s.format,
          })),
        },
      },
    });
  });
  revalidatePath("/admin/courses");
  revalidatePath(`/admin/courses/${id}`);
  revalidateSite();
}

export async function deleteCourse(id: string) {
  await requireAdmin();
  await prisma.schedule.deleteMany({ where: { courseId: id } });
  await prisma.courseRelation.deleteMany({ where: { courseId: id } });
  await prisma.courseRelation.deleteMany({ where: { relatedId: id } });
  await prisma.course.delete({ where: { id } });
  revalidatePath("/admin/courses");
  revalidateSite();
}