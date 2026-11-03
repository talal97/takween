import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { serializeJsonLd } from "@/lib/safe-json";

const db = vi.hoisted(() => ({
  course: { findFirst: vi.fn(), findMany: vi.fn() },
  article: { findFirst: vi.fn() },
  country: { findMany: vi.fn() },
  providerAssociation: { findMany: vi.fn() },
  siteSetting: { findUnique: vi.fn() },
}));
vi.mock("@/lib/prisma", () => ({ prisma: db }));
vi.mock("next-intl/server", () => ({ setRequestLocale: vi.fn(), getTranslations: async () => (key: string) => key }));
vi.mock("@/lib/data", () => ({ localeText: (field: { en?: string; ar?: string }, locale: string) => locale === "ar" && field.ar ? field.ar : field.en || "" }));
vi.mock("@/lib/seo", () => ({ siteUrl: (s: string) => s, absoluteImage: (s: string) => s, courseJsonLd: async (s: unknown) => s, buildPageMetadata: (s: unknown) => s }));
vi.mock("@/i18n/navigation", () => ({ Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a> }));
vi.mock("@/components/site/breadcrumb", () => ({ Breadcrumb: () => null }));
vi.mock("@/components/site/share-buttons", () => ({ ShareButtons: () => null }));
vi.mock("@/components/site/registration-form", () => ({ RegistrationForm: () => null }));

beforeEach(() => {
  vi.clearAllMocks();
  db.course.findMany.mockResolvedValue([]);
  db.country.findMany.mockResolvedValue([]);
  db.providerAssociation.findMany.mockResolvedValue([]);
  db.siteSetting.findUnique.mockResolvedValue(null);
});

describe("localized publishing", () => {
  it.each(["ar", "en"])("renders %s course sections without the other translation", async (locale) => {
    const suffix = locale === "ar" ? "Ar" : "En";
    db.course.findFirst.mockResolvedValue({
      id: "c1", slug: "course", locale, code: "C1", durationDays: 5,
      [`title${suffix}`]: "Localized title", [`intro${suffix}`]: "Localized introduction",
      [`objectives${suffix}`]: "Localized objectives", [`methodology${suffix}`]: "Localized method",
      [`orgImpact${suffix}`]: "Localized organization", [`personalImpact${suffix}`]: "Localized personal",
      [`targetAudience${suffix}`]: "Localized audience", [`badge${suffix}`]: "Localized badge",
      category: { faqs: [] }, schedules: [], certificates: [], relatedAsSource: [],
    });
    const { default: Page } = await import("@/app/[locale]/training-course/[slug]/page");
    const html = renderToStaticMarkup(await Page({ params: Promise.resolve({ locale, slug: "course" }) }));
    for (const text of ["introduction", "objectives", "method", "organization", "personal", "audience", "badge"]) {
      expect(html).toContain(`Localized ${text}`);
    }
    expect(db.course.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { slug: "course", locale: { in: [locale, "both"] } } }));
  });

  it("does not expose draft articles through page or metadata", async () => {
    db.article.findFirst.mockResolvedValue(null);
    const { default: Page, generateMetadata } = await import("@/app/[locale]/resources/[slug]/page");
    const params = Promise.resolve({ locale: "ar", slug: "draft" });
    await expect(Page({ params })).rejects.toThrow("NOT_FOUND");
    await generateMetadata({ params });
    expect(db.article.findFirst).toHaveBeenCalledTimes(2);
    for (const [query] of db.article.findFirst.mock.calls) expect(query.where).toEqual({ slug: "draft", status: "published", locale: { in: ["ar", "both"] } });
  });
});

it("keeps script-closing content as JSON data", () => {
  const value = { name: '</script><script>alert(1)</script>', alternate: '</ScRiPt><img src=x onerror=alert(1)>' };
  const serialized = serializeJsonLd(value);
  expect(serialized).not.toContain("<");
  expect(JSON.parse(serialized)).toEqual(value);
});
