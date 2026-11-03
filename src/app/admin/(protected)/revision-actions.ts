"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin, revalidateSite } from "./actions-helpers";
import { articleRestoreData, captureRevision, courseRestoreData, type RevisionKind } from "@/lib/content-revisions";
import { revalidatePath } from "next/cache";

function checkKind(kind: string): asserts kind is RevisionKind {
  if (kind !== "course" && kind !== "article") throw new Error("Invalid content type");
}

export async function listRevisions(kind: RevisionKind, entityId: string) {
  await requireAdmin(); checkKind(kind);
  const rows = await prisma.contentRevision.findMany({ where: { kind, entityId }, orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: 50 });
  return rows.map((row) => ({ ...row, createdAt: row.createdAt.toISOString(), snapshot: row.snapshot as Record<string, unknown> }));
}

export async function restoreRevision(kind: RevisionKind, entityId: string, revisionId: string) {
  const session = await requireAdmin(); checkKind(kind);
  await prisma.$transaction(async (tx) => {
    const revision = await tx.contentRevision.findFirstOrThrow({ where: { id: revisionId, kind, entityId } });
    await captureRevision(tx, kind, entityId, session.user.email || session.user.id || "Admin");
    const snapshot = revision.snapshot as Record<string, unknown>;
    if (kind === "article") {
      await tx.article.update({ where: { id: entityId }, data: articleRestoreData(snapshot) });
    } else {
      const schedules = snapshot.schedules as Array<{ id: string; venueId: string; startDate: string; endDate: string; fee: string; currency: string; format: string; active: boolean }>;
      const certificates = snapshot.certificates as Array<{ id: string }>;
      const related = snapshot.relatedAsSource as Array<{ relatedId: string }>;
      await tx.schedule.deleteMany({ where: { courseId: entityId } });
      await tx.courseRelation.deleteMany({ where: { courseId: entityId } });
      await tx.course.update({ where: { id: entityId }, data: {
        ...courseRestoreData(snapshot),
        certificates: { set: certificates.map(({ id }) => ({ id })) },
        relatedAsSource: { create: related.map(({ relatedId }) => ({ relatedId })) },
        schedules: { create: schedules.map(({ id, venueId, startDate, endDate, fee, currency, format, active }) => ({ id, venueId, startDate: new Date(startDate), endDate: new Date(endDate), fee, currency, format, active })) },
      } });
    }
  });
  revalidateSite();
  revalidatePath(`/admin/${kind === "course" ? "courses" : "articles"}`);
  revalidatePath(`/admin/${kind === "course" ? "courses" : "articles"}/${entityId}`);
}
