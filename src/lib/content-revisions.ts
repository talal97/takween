import { Prisma } from "@prisma/client";

export type RevisionKind = "course" | "article";
export const courseRevisionInclude = { schedules: true, certificates: { select: { id: true } }, relatedAsSource: { select: { relatedId: true } } } as const;

// Lock before reading so simultaneous saves each retain the version they replace.
export async function captureRevision(tx: Prisma.TransactionClient, kind: RevisionKind, entityId: string, actor: string) {
  if (kind === "course") await tx.$queryRaw`SELECT id FROM "Course" WHERE id = ${entityId} FOR UPDATE`;
  else await tx.$queryRaw`SELECT id FROM "Article" WHERE id = ${entityId} FOR UPDATE`;
  const record = kind === "course"
    ? await tx.course.findUniqueOrThrow({ where: { id: entityId }, include: courseRevisionInclude })
    : await tx.article.findUniqueOrThrow({ where: { id: entityId } });
  await tx.contentRevision.create({ data: { kind, entityId, actor, snapshot: JSON.parse(JSON.stringify(record)) as Prisma.InputJsonValue } });
}

export function courseRestoreData(snapshot: Record<string, unknown>): Prisma.CourseUncheckedUpdateInput {
  const fields = ["code", "slug", "locale", "titleEn", "titleAr", "subtitleEn", "subtitleAr", "badgeEn", "badgeAr", "durationDays", "image", "featured", "introEn", "introAr", "objectivesEn", "objectivesAr", "methodologyEn", "methodologyAr", "orgImpactEn", "orgImpactAr", "personalImpactEn", "personalImpactAr", "targetAudienceEn", "targetAudienceAr", "certificateNoteEn", "certificateNoteAr", "categoryId", "seoTitleEn", "seoTitleAr"];
  return {
    ...Object.fromEntries(fields.filter((key) => key in snapshot).map((key) => [key, snapshot[key]])),
    dayOutlineEn: snapshot.dayOutlineEn == null ? Prisma.DbNull : snapshot.dayOutlineEn as Prisma.InputJsonValue,
    dayOutlineAr: snapshot.dayOutlineAr == null ? Prisma.DbNull : snapshot.dayOutlineAr as Prisma.InputJsonValue,
  };
}

export function articleRestoreData(snapshot: Record<string, unknown>): Prisma.ArticleUpdateInput {
  const fields = ["slug", "locale", "titleEn", "titleAr", "excerptEn", "excerptAr", "bodyEn", "bodyAr", "status", "type", "image"];
  return Object.fromEntries(fields.filter((key) => key in snapshot).map((key) => [key, snapshot[key]]));
}
