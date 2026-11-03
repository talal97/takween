import { beforeEach, expect, it, vi } from "vitest";
import { encryptCaptcha } from "@/lib/captcha";

const mocks = vi.hoisted(() => ({
  token: "",
  prisma: {
    captchaUse: { create: vi.fn(), deleteMany: vi.fn() },
    registration: { count: vi.fn(), create: vi.fn() },
  },
  mail: vi.fn(async () => undefined),
}));
vi.mock("@/lib/prisma", () => ({ prisma: mocks.prisma }));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => ({ value: mocks.token }) }) }));
vi.mock("@/lib/rate-limit", () => ({ checkRateLimit: () => true }));
vi.mock("@/lib/mail", () => ({ sendRegistrationEmail: mocks.mail, sendAdminAlert: mocks.mail }));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.token = encryptCaptcha("abcde");
  mocks.prisma.captchaUse.create.mockResolvedValue({});
  mocks.prisma.captchaUse.deleteMany.mockResolvedValue({ count: 0 });
  mocks.prisma.registration.count.mockResolvedValue(0);
  mocks.prisma.registration.create.mockResolvedValue({ id: "registration123" });
});

const input = { type: "register" as const, courseTitle: "Course", fullName: "Test User", email: "test@example.com", locale: "ar", captcha: "abcde" };

it("stores legitimate registrations without email-only fields", async () => {
  const { submitRegistration } = await import("@/lib/actions/registration");
  expect(await submitRegistration({ ...input, venueName: "Riyadh", fee: "100", currency: "SAR", country: "Saudi Arabia", format: "online" })).toEqual({ ok: true, ref: "registra" });
  const data = mocks.prisma.registration.create.mock.calls[0][0].data;
  expect(data.locale).toBe("ar");
  for (const field of ["captcha", "venueName", "fee", "currency", "country", "format"]) expect(data).not.toHaveProperty(field);
  expect(mocks.mail).toHaveBeenCalledTimes(2);
});

it("rejects a replay before storing or emailing", async () => {
  mocks.prisma.captchaUse.create.mockRejectedValue({ code: "P2002" });
  const { submitRegistration } = await import("@/lib/actions/registration");
  expect(await submitRegistration(input)).toEqual({ ok: false, error: "captcha" });
  expect(mocks.prisma.registration.create).not.toHaveBeenCalled();
  expect(mocks.mail).not.toHaveBeenCalled();
});

it("rejects a changed token representation before consuming it", async () => {
  mocks.token += ".replay";
  const { submitRegistration } = await import("@/lib/actions/registration");
  expect(await submitRegistration(input)).toEqual({ ok: false, error: "captcha" });
  expect(mocks.prisma.captchaUse.create).not.toHaveBeenCalled();
});
