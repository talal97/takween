import { beforeEach, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

const db = vi.hoisted(() => ({ $transaction: vi.fn(), article: { create: vi.fn(), update: vi.fn(), findUnique: vi.fn() }, certificate: { update: vi.fn() } }));
vi.mock("@/lib/content-revisions", () => ({ captureRevision: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ prisma: db }));
vi.mock("@/app/admin/(protected)/actions-helpers", () => ({ requireAdmin: vi.fn(), revalidateSite: vi.fn() }));
vi.mock("@/components/admin/article-form", () => ({ ArticleForm: ({ initial }: { initial: unknown }) => <pre>{JSON.stringify(initial)}</pre> }));

beforeEach(() => {
  vi.clearAllMocks(); db.$transaction.mockImplementation((fn) => fn(db));
  db.article.create.mockResolvedValue({ id: "new" });
});

it.each(["en", "ar", "both"] as const)("creates and updates articles with %s visibility, preserving the other language", async (locale) => {
  const { createArticle, updateArticle } = await import("@/app/admin/(protected)/actions-content");
  const input = { slug: "review", locale, titleEn: "English", titleAr: "عربي", bodyEn: "English body", bodyAr: "نص عربي", type: "press" as const, image: "/image.jpg" };
  expect(await createArticle(input)).toBe("new");
  await updateArticle("id", input);
  expect(db.article.create).toHaveBeenCalledWith({ data: { ...input, status: "published" } });
  expect(db.article.update).toHaveBeenCalledWith({ where: { id: "id" }, data: { ...input, status: "published" } });
});

it.each(["en", "ar"] as const)("rejects a missing %s title before publishing", async (locale) => {
  const { createArticle } = await import("@/app/admin/(protected)/actions-content");
  await expect(createArticle({ slug: "review", locale, titleEn: locale === "en" ? " " : "English", titleAr: locale === "ar" ? " " : "عربي" })).rejects.toThrow("selected website language");
  expect(db.article.create).not.toHaveBeenCalled();
});

it("keeps legacy shared articles compatible and allows Arabic-only content", async () => {
  const { createArticle } = await import("@/app/admin/(protected)/actions-content");
  await createArticle({ slug: "review", titleAr: "عربي" });
  expect(db.article.create).toHaveBeenCalledWith({ data: expect.objectContaining({ locale: "both", titleEn: "", titleAr: "عربي" }) });
});

it("loads image, type and visibility into the article edit form", async () => {
  db.article.findUnique.mockResolvedValue({ id: "id", slug: "press", titleEn: "", titleAr: "عربي", locale: "ar", status: "published", type: "press", image: "/keep.jpg" });
  const { default: Edit } = await import("@/app/admin/(protected)/articles/[id]/page");
  const html = renderToStaticMarkup(await Edit({ params: Promise.resolve({ id: "id" }) }));
  expect(html).toContain("/keep.jpg");
  expect(html).toContain("press");
  expect(html).toContain("عربي");
  expect(html).toContain("&quot;locale&quot;:&quot;ar&quot;");
});

it("persists the edited certificate slug", async () => {
  const { updateCertificate } = await import("@/app/admin/(protected)/actions-content");
  await updateCertificate("id", { code: "CERT", nameEn: "Certificate", slug: "new-slug" });
  expect(db.certificate.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ slug: "new-slug" }) }));
});
