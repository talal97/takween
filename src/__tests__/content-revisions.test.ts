import { beforeEach, expect, it, vi } from "vitest";
import { articleRestoreData, captureRevision, courseRestoreData } from "@/lib/content-revisions";
import { Prisma } from "@prisma/client";
import { previewText } from "@/components/admin/content-preview";

const mock = vi.hoisted(() => ({
  guard: vi.fn(), transaction: vi.fn(), query: vi.fn(),
  revisions: { findMany: vi.fn(), findFirstOrThrow: vi.fn(), create: vi.fn() },
  article: { findUniqueOrThrow: vi.fn(), update: vi.fn() },
  course: { findUniqueOrThrow: vi.fn(), update: vi.fn() },
  schedule: { deleteMany: vi.fn() }, relation: { deleteMany: vi.fn() },
}));
const tx = { $queryRaw: mock.query, contentRevision: mock.revisions, article: mock.article, course: mock.course, schedule: mock.schedule, courseRelation: mock.relation };
vi.mock("@/lib/prisma", () => ({ prisma: { $transaction: mock.transaction, contentRevision: mock.revisions } }));
vi.mock("@/app/admin/(protected)/actions-helpers", () => ({ requireAdmin: mock.guard, revalidateSite: vi.fn() }));
beforeEach(() => {
  vi.clearAllMocks();
  mock.guard.mockResolvedValue({ user: { email: "admin@example.test" } });
  mock.transaction.mockImplementation((fn) => fn(tx));
  mock.article.findUniqueOrThrow.mockResolvedValue({ id: "a", titleEn: "Current", titleAr: "الحالي", status: "draft" });
  mock.course.findUniqueOrThrow.mockResolvedValue({ id: "c", titleEn: "Current", titleAr: "الحالي", schedules: [] });
});

it("captures both article translations after taking a row lock", async () => {
  await captureRevision(tx as unknown as Prisma.TransactionClient, "article", "a", "admin");
  expect(mock.query).toHaveBeenCalledOnce();
  expect(mock.revisions.create).toHaveBeenCalledWith({ data: expect.objectContaining({ kind: "article", entityId: "a", snapshot: expect.objectContaining({ titleEn: "Current", titleAr: "الحالي", status: "draft" }) }) });
  expect(mock.query.mock.invocationCallOrder[0]).toBeLessThan(mock.article.findUniqueOrThrow.mock.invocationCallOrder[0]);
});

it("restores a scoped article version and backs up current content first", async () => {
  mock.revisions.findFirstOrThrow.mockResolvedValue({ snapshot: { titleEn: "Old", titleAr: "السابق", status: "draft", locale: "ar", image: "/old.png", id: "forged-id" } });
  const { restoreRevision } = await import("@/app/admin/(protected)/revision-actions");
  await restoreRevision("article", "a", "r");
  expect(mock.revisions.findFirstOrThrow).toHaveBeenCalledWith({ where: { id: "r", kind: "article", entityId: "a" } });
  expect(mock.article.update).toHaveBeenCalledWith({ where: { id: "a" }, data: { titleEn: "Old", titleAr: "السابق", status: "draft", locale: "ar", image: "/old.png" } });
  expect(mock.revisions.create.mock.invocationCallOrder[0]).toBeLessThan(mock.article.update.mock.invocationCallOrder[0]);
});

it("restores both course outlines, session IDs, pricing and relationships", async () => {
  const outline = [{ day: 1, title: "اليوم الأول", topics: ["مقدمة"] }];
  mock.revisions.findFirstOrThrow.mockResolvedValue({ snapshot: { titleEn: "Old", titleAr: "السابق", locale: "both", dayOutlineEn: [], dayOutlineAr: outline, schedules: [{ id: "s", venueId: "v", startDate: "2026-12-01", endDate: "2026-12-05", fee: "100.00", currency: "SAR", format: "classroom", active: false }], certificates: [{ id: "cert" }], relatedAsSource: [{ relatedId: "related" }] } });
  const { restoreRevision } = await import("@/app/admin/(protected)/revision-actions");
  await restoreRevision("course", "c", "r");
  expect(mock.course.update.mock.calls[0][0].data).toMatchObject({ titleAr: "السابق", dayOutlineAr: outline, certificates: { set: [{ id: "cert" }] }, relatedAsSource: { create: [{ relatedId: "related" }] }, schedules: { create: [{ id: "s", currency: "SAR", active: false }] } });
});

it("does not restore another record's revision or mutate data after denied access", async () => {
  const { restoreRevision, listRevisions } = await import("@/app/admin/(protected)/revision-actions");
  mock.revisions.findFirstOrThrow.mockRejectedValueOnce(new Error("Not found"));
  await expect(restoreRevision("article", "other", "r")).rejects.toThrow("Not found");
  expect(mock.revisions.create).not.toHaveBeenCalled();
  mock.guard.mockRejectedValueOnce(new Error("Unauthorized"));
  await expect(listRevisions("article", "a")).rejects.toThrow("Unauthorized");
  expect(mock.revisions.findMany).not.toHaveBeenCalled();
});

it("only restores content fields and explicitly clears nullable outlines", () => {
  expect(articleRestoreData({ id: "x", createdAt: "today", titleAr: "عربي" })).toEqual({ titleAr: "عربي" });
  expect(courseRestoreData({ dayOutlineAr: null }).dayOutlineAr).toBe(Prisma.DbNull);
});

it.each(["en", "ar"] as const)("uses %s preview text with the same missing-translation fallback", (locale) => {
  const data = { titleEn: "English", titleAr: "عربي" };
  expect(previewText(data, "title", locale)).toBe(locale === "ar" ? "عربي" : "English");
  expect(previewText({ titleEn: "English", titleAr: " " }, "title", "ar")).toBe("English");
});
