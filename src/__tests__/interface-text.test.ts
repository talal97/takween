import { beforeEach, expect, it, vi } from "vitest";
import { IntlMessageFormat } from "intl-messageformat";
import { applyInterfaceText, interfaceFields, interfaceSettingKey, validateInterfaceText } from "@/lib/interface-text";
import en from "../../messages/en.json";
import ar from "../../messages/ar.json";

const mocks = vi.hoisted(() => ({ guard: vi.fn(), upsert: vi.fn(), transaction: vi.fn(), revalidate: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ prisma: { siteSetting: { upsert: mocks.upsert }, $transaction: mocks.transaction } }));
vi.mock("@/app/admin/(protected)/actions-helpers", () => ({ requireAdmin: mocks.guard, revalidateSite: mocks.revalidate }));
beforeEach(() => { vi.clearAllMocks(); mocks.guard.mockResolvedValue({}); });

it("uses independent language overrides and leaves the original catalogue unchanged", () => {
  const settings = { interface_en_navigation: "ignored", [interfaceSettingKey("en", "navigation.home")]: "Welcome", [interfaceSettingKey("ar", "navigation.home")]: "البداية", smtp_pass: "secret" };
  const english = applyInterfaceText(en, settings, "en");
  const arabic = applyInterfaceText(ar, settings, "ar");
  expect(english.navigation.home).toBe("Welcome");
  expect(arabic.navigation.home).toBe("البداية");
  expect(en.navigation.home).toBe("Home");
  expect(JSON.stringify(english)).not.toContain("secret");
});

it("restores defaults for blank values and ignores malformed stored text", () => {
  for (const value of ["", "   ", "<script>bad</script>", "{unknown}", "x".repeat(501)]) {
    expect(applyInterfaceText(en, { [interfaceSettingKey("en", "navigation.home")]: value }, "en").navigation.home).toBe("Home");
  }
});

it("preserves apostrophes when labels pass through the translation formatter", () => {
  const value = "Learner's courses & training";
  const messages = applyInterfaceText(en, { [interfaceSettingKey("en", "navigation.home")]: value }, "en");
  expect(new IntlMessageFormat(messages.navigation.home, "en").format()).toBe(value);
});

it("rejects unknown fields, HTML, placeholders, and excessive text", () => {
  expect(() => validateInterfaceText({ smtp_pass: "no" })).toThrow();
  for (const value of ["<b>text</b>", "{name}", "x".repeat(501)]) expect(() => validateInterfaceText({ "navigation.home": value })).toThrow();
  expect(interfaceFields.length).toBeGreaterThan(70);
});

it("saves only changed fields for the selected language and invalidates the public cache", async () => {
  const { saveInterfaceText } = await import("@/app/admin/(protected)/interface-text/actions");
  await saveInterfaceText("ar", { "navigation.home": "  البداية  " });
  expect(mocks.guard).toHaveBeenCalledOnce();
  expect(mocks.upsert).toHaveBeenCalledExactlyOnceWith({ where: { key: "interface_ar_navigation.home" }, update: { value: "البداية" }, create: { key: "interface_ar_navigation.home", value: "البداية" } });
  expect(mocks.transaction).toHaveBeenCalledOnce();
  expect(mocks.revalidate).toHaveBeenCalledOnce();
});

it("does not write anything when authorization fails", async () => {
  mocks.guard.mockRejectedValueOnce(new Error("Unauthorized"));
  const { saveInterfaceText } = await import("@/app/admin/(protected)/interface-text/actions");
  await expect(saveInterfaceText("en", { "navigation.home": "Welcome" })).rejects.toThrow("Unauthorized");
  expect(mocks.upsert).not.toHaveBeenCalled();
});
