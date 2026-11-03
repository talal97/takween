import { expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
const settings = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("@/lib/settings", () => ({ getSettingsCached: settings.get }));

it("renders supported colors while excluding HTML and CSS injection", async () => {
  settings.get.mockResolvedValue({
    color_brand: "#026481",
    color_brand_ar: "#abc",
    color_navy: '</style><script>alert(1)</script>',
    color_gold_ar: '#fff;}body{display:none',
  });
  const { ThemeStyle } = await import("@/components/site/theme-style");
  const html = renderToStaticMarkup(await ThemeStyle());
  expect(html).toContain("--brand: #026481;");
  expect(html).toContain('html[lang="ar"]{--brand: #abc;}');
  expect(html).not.toContain("<script");
  expect(html).not.toContain("display:none");
});
