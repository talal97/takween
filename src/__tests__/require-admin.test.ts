import { describe, it, expect, vi, beforeEach } from "vitest";
import { redirect } from "next/navigation";

const mockAuth = vi.fn();

vi.mock("@/auth", () => ({
  auth: (...args: unknown[]) => mockAuth(...args),
}));

describe("requireAdmin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("redirects to login when no session", async () => {
    mockAuth.mockResolvedValue(null);

    const { requireAdmin } = await import("@/lib/require-admin");

    await expect(requireAdmin()).rejects.toThrow("REDIRECT:/admin/login");
    expect(redirect).toHaveBeenCalledWith("/admin/login");
  });

  it("redirects to login on auth error (stale JWT)", async () => {
    mockAuth.mockRejectedValue(new Error("JWT error"));

    const { requireAdmin } = await import("@/lib/require-admin");

    await expect(requireAdmin()).rejects.toThrow("REDIRECT:/admin/login");
  });

  it("returns session when authenticated", async () => {
    const fakeSession = { user: { id: "1", role: "admin" } };
    mockAuth.mockResolvedValue(fakeSession);

    const { requireAdmin } = await import("@/lib/require-admin");

    const result = await requireAdmin();
    expect(result).toEqual(fakeSession);
  });
});

describe("requireOwner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("redirects to admin when user is not owner", async () => {
    mockAuth.mockResolvedValue({ user: { id: "1", role: "admin" } });

    const { requireOwner } = await import("@/lib/require-admin");

    await expect(requireOwner()).rejects.toThrow("REDIRECT:/admin");
  });

  it("returns session when user is owner", async () => {
    const fakeSession = { user: { id: "1", role: "owner" } };
    mockAuth.mockResolvedValue(fakeSession);

    const { requireOwner } = await import("@/lib/require-admin");

    const result = await requireOwner();
    expect(result).toEqual(fakeSession);
  });

  it("redirects to login when no session", async () => {
    mockAuth.mockResolvedValue(null);

    const { requireOwner } = await import("@/lib/require-admin");

    await expect(requireOwner()).rejects.toThrow("REDIRECT:/admin/login");
  });
});
