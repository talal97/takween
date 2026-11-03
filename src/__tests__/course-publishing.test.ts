import { beforeEach, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({ course: { create: vi.fn(), update: vi.fn() }, schedule: { deleteMany: vi.fn() }, courseRelation: { deleteMany: vi.fn() }, $transaction: vi.fn() }));
vi.mock("@/lib/content-revisions", () => ({ captureRevision: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ prisma: db }));
vi.mock("@/lib/require-admin", () => ({ requireAdmin: vi.fn() }));
vi.mock("@/lib/data", () => ({ SITE_TAG: "site" }));
beforeEach(() => {
  vi.clearAllMocks();
  db.course.create.mockResolvedValue({ id: "new-course" });
  db.$transaction.mockImplementation((fn) => fn(db));
});
const base = { code: "QA-AR", slug: "دورة عربية", locale: "ar" as const, categoryId: "cat", titleEn: null, titleAr: "دورة عربية", durationDays: 5, featured: false };
const english = [{ day: 1, title: "English day", topics: ["English topic"] }];
const arabic = [{ day: 1, title: "اليوم الأول", topics: ["موضوع عربي"] }];

it("creates and updates Arabic content independently from English", async () => {
  const { createCourse, updateCourse } = await import("@/app/admin/(protected)/course-actions");
  await createCourse(base, [], english, [], [], arabic);
  expect(db.course.create.mock.calls[0][0].data).toMatchObject({ locale: "ar", slug: "دورة-عربية", titleAr: base.titleAr, dayOutlineEn: english, dayOutlineAr: arabic });
  await updateCourse("new-course", base, [], english, [], [], arabic);
  expect(db.course.update.mock.calls[0][0].data).toMatchObject({ dayOutlineEn: english, dayOutlineAr: arabic });
});

it("rejects missing matching-language titles before writing", async () => {
  const { createCourse } = await import("@/app/admin/(protected)/course-actions");
  await expect(createCourse({ ...base, titleAr: " " }, [], [], [], [])).rejects.toThrow("Title required for ar");
  await expect(createCourse({ ...base, locale: "en" }, [], [], [], [])).rejects.toThrow("Title required for en");
  expect(db.course.create).not.toHaveBeenCalled();
});

it("rejects invalid schedules before deleting existing sessions", async () => {
  const { updateCourse } = await import("@/app/admin/(protected)/course-actions");
  await expect(updateCourse("c1", base, [{ venueId: "v1", startDate: "2026-12-02", endDate: "2026-12-01", fee: 100, currency: "USD", format: "classroom" }], [], [], [])).rejects.toThrow();
  expect(db.$transaction).not.toHaveBeenCalled();
});

it("preserves inactive sessions and SAR pricing when editing a course", async () => {
  const { updateCourse } = await import("@/app/admin/(protected)/course-actions");
  await updateCourse("c1", base, [{ active: false, venueId: "v1", startDate: "2026-12-01", endDate: "2026-12-05", fee: 100, currency: "SAR", format: "classroom" }], [], [], []);
  expect(db.course.update.mock.calls[0][0].data.schedules.create[0]).toMatchObject({ active: false, currency: "SAR", fee: 100 });
});
