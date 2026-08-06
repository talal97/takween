"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "./actions-helpers";
import {
  scrapeCourses,
  scrapeCourseDetail,
  scrapeCategories,
  scrapeSuperCategories,
  scrapeCertificates,
  scrapeArticles,
} from "@/lib/scraper";
import { revalidatePath } from "next/cache";

type ImportResult = {
  type: string;
  slug: string;
  status: "imported" | "skipped" | "error";
  message?: string;
};

export async function fetchLiveContent(): Promise<{
  courses: number;
  categories: number;
  superCategories: number;
  certificates: number;
  articles: number;
}> {
  await requireAdmin();
  const [courses, categories, superCategories, certificates, articles] = await Promise.all([
    scrapeCourses(),
    scrapeCategories(),
    scrapeSuperCategories(),
    scrapeCertificates(),
    scrapeArticles(),
  ]);
  return {
    courses: courses.length,
    categories: categories.length,
    superCategories: superCategories.length,
    certificates: certificates.length,
    articles: articles.length,
  };
}

export async function importCourses(): Promise<ImportResult[]> {
  await requireAdmin();
  const scraped = await scrapeCourses();
  const results: ImportResult[] = [];

  for (const s of scraped) {
    try {
      const detail = await scrapeCourseDetail(s.slug);
      const data = detail || s;

      // Find or create category
      let categoryId = "";
      const cats = await prisma.category.findMany();
      if (cats.length > 0) categoryId = cats[0].id;

      const existing = await prisma.course.findFirst({ where: { slug: s.slug } });
      if (existing) {
        results.push({ type: "course", slug: s.slug, status: "skipped", message: "Already exists" });
        continue;
      }

      await prisma.course.create({
        data: {
          code: data.code,
          slug: data.slug,
          locale: "both",
          titleEn: data.titleEn,
          subtitleEn: data.subtitleEn,
          introEn: data.introEn,
          objectivesEn: data.objectivesEn,
          methodologyEn: data.methodologyEn,
          targetAudienceEn: data.targetAudienceEn,
          orgImpactEn: data.orgImpactEn,
          personalImpactEn: data.personalImpactEn,
          certificateNoteEn: data.certificateNoteEn,
          durationDays: data.durationDays,
          categoryId,
        },
      });
      results.push({ type: "course", slug: s.slug, status: "imported" });
    } catch (e) {
      results.push({ type: "course", slug: s.slug, status: "error", message: String(e) });
    }
  }
  revalidatePath("/admin");
  return results;
}

export async function importCategories(): Promise<ImportResult[]> {
  await requireAdmin();
  const scraped = await scrapeCategories();
  const results: ImportResult[] = [];

  for (const s of scraped) {
    try {
      const existing = await prisma.category.findUnique({ where: { slug: s.slug } });
      if (existing) {
        results.push({ type: "category", slug: s.slug, status: "skipped", message: "Already exists" });
        continue;
      }
      await prisma.category.create({
        data: { slug: s.slug, nameEn: s.nameEn, taglineEn: s.taglineEn },
      });
      results.push({ type: "category", slug: s.slug, status: "imported" });
    } catch (e) {
      results.push({ type: "category", slug: s.slug, status: "error", message: String(e) });
    }
  }
  revalidatePath("/admin");
  return results;
}

export async function importSuperCategories(): Promise<ImportResult[]> {
  await requireAdmin();
  const scraped = await scrapeSuperCategories();
  const results: ImportResult[] = [];

  for (const s of scraped) {
    try {
      const existing = await prisma.superCategory.findUnique({ where: { slug: s.slug } });
      if (existing) {
        results.push({ type: "superCategory", slug: s.slug, status: "skipped", message: "Already exists" });
        continue;
      }
      await prisma.superCategory.create({
        data: { slug: s.slug, nameEn: s.nameEn },
      });
      results.push({ type: "superCategory", slug: s.slug, status: "imported" });
    } catch (e) {
      results.push({ type: "superCategory", slug: s.slug, status: "error", message: String(e) });
    }
  }
  revalidatePath("/admin");
  return results;
}

export async function importCertificates(): Promise<ImportResult[]> {
  await requireAdmin();
  const scraped = await scrapeCertificates();
  const results: ImportResult[] = [];

  for (const s of scraped) {
    try {
      const existing = await prisma.certificate.findUnique({ where: { slug: s.slug } });
      if (existing) {
        results.push({ type: "certificate", slug: s.slug, status: "skipped", message: "Already exists" });
        continue;
      }
      await prisma.certificate.create({
        data: { slug: s.slug, code: s.code, nameEn: s.nameEn, description: s.description },
      });
      results.push({ type: "certificate", slug: s.slug, status: "imported" });
    } catch (e) {
      results.push({ type: "certificate", slug: s.slug, status: "error", message: String(e) });
    }
  }
  revalidatePath("/admin");
  return results;
}

export async function importArticles(): Promise<ImportResult[]> {
  await requireAdmin();
  const scraped = await scrapeArticles();
  const results: ImportResult[] = [];

  for (const s of scraped) {
    try {
      const existing = await prisma.article.findUnique({ where: { slug: s.slug } });
      if (existing) {
        results.push({ type: "article", slug: s.slug, status: "skipped", message: "Already exists" });
        continue;
      }
      await prisma.article.create({
        data: { slug: s.slug, titleEn: s.titleEn, excerptEn: s.excerptEn, status: "published" },
      });
      results.push({ type: "article", slug: s.slug, status: "imported" });
    } catch (e) {
      results.push({ type: "article", slug: s.slug, status: "error", message: String(e) });
    }
  }
  revalidatePath("/admin");
  return results;
}

export async function importAll(): Promise<{
  courses: ImportResult[];
  categories: ImportResult[];
  superCategories: ImportResult[];
  certificates: ImportResult[];
  articles: ImportResult[];
}> {
  await requireAdmin();
  const [courses, categories, superCategories, certificates, articles] = await Promise.all([
    importCourses(),
    importCategories(),
    importSuperCategories(),
    importCertificates(),
    importArticles(),
  ]);
  return { courses, categories, superCategories, certificates, articles };
}

export async function deleteItem(type: string, id: string): Promise<{ ok: boolean }> {
  await requireAdmin();
  try {
    switch (type) {
      case "course":
        await prisma.schedule.deleteMany({ where: { courseId: id } });
        await prisma.courseRelation.deleteMany({ where: { courseId: id } });
        await prisma.courseRelation.deleteMany({ where: { relatedId: id } });
        await prisma.course.delete({ where: { id } });
        break;
      case "category":
        await prisma.course.deleteMany({ where: { categoryId: id } });
        await prisma.category.delete({ where: { id } });
        break;
      case "superCategory":
        await prisma.category.deleteMany({ where: { superCategoryId: id } });
        await prisma.superCategory.delete({ where: { id } });
        break;
      case "certificate":
        await prisma.certificate.delete({ where: { id } });
        break;
      case "article":
        await prisma.article.delete({ where: { id } });
        break;
      default:
        return { ok: false };
    }
    revalidatePath("/admin");
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
