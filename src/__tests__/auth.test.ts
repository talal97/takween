import { describe, it, expect, vi, beforeEach } from "vitest";

// We need to test the rate limiter logic in auth.config.ts.
// Since the module has side effects (top-level AUTH_SECRET check), we test
// the exported `authConfig` and the authorize flow via mocks.

type CredentialsProvider = {
  options?: {
    authorize?: (
      credentials: Record<string, unknown> | undefined,
      req: unknown,
    ) => Promise<Record<string, unknown> | null>;
  };
};
type AuthorizedCallback = (params: {
  auth: unknown;
  request: unknown;
}) => boolean;
type JwtCallback = (params: {
  token: Record<string, unknown>;
  user?: Record<string, unknown>;
}) => Promise<Record<string, unknown> | null>;
type SessionCallback = (params: {
  session: { user: Record<string, unknown> };
  token: Record<string, unknown>;
}) => { user: Record<string, unknown> };

async function getAuth() {
  const { authConfig } = await import("@/auth/auth.config");
  const provider = authConfig.providers?.[0] as unknown as CredentialsProvider;
  const authorize = provider.options?.authorize;
  if (!authorize) throw new Error("credentials authorize is missing");
  return { authConfig, authorize };
}

const mockPrisma = {
  user: {
    findUnique: vi.fn(),
  },
};

vi.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

// We need to test rate limiting through the authorize function
// since checkRateLimit is not exported. We simulate multiple calls.

describe("auth rate limiting", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("authorize returns null for missing credentials", async () => {
    const { authorize } = await getAuth();

    const result = await authorize(
      { email: undefined, password: undefined },
      {},
    );
    expect(result).toBeNull();
  });

  it("authorize returns null when user not found", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    const { authorize } = await getAuth();

    const result = await authorize(
      { email: "test@example.com", password: "pass123" },
      {},
    );
    expect(result).toBeNull();
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: "test@example.com" },
    });
  });

  it("authorize returns null for wrong password", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "1",
      email: "test@example.com",
      name: "Test",
      role: "admin",
      passwordHash: "$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ12",
    });

    const { authorize } = await getAuth();

    const result = await authorize(
      { email: "test@example.com", password: "wrongpassword" },
      {},
    );
    expect(result).toBeNull();
  });

  it("authorize returns user object on valid credentials", async () => {
    // Hash "correctpassword" with bcrypt
    const bcrypt = await import("bcryptjs");
    const hash = await bcrypt.hash("correctpassword", 10);

    mockPrisma.user.findUnique.mockResolvedValue({
      id: "user-1",
      email: "admin@example.com",
      name: "Admin",
      role: "owner",
      passwordHash: hash,
    });

    const { authorize } = await getAuth();

    const result = await authorize(
      { email: "admin@example.com", password: "correctpassword" },
      {},
    );
    expect(result).toEqual({
      id: "user-1",
      email: "admin@example.com",
      name: "Admin",
      role: "owner",
    });
  });

  it("rate limiter blocks after MAX_ATTEMPTS", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    const { authorize } = await getAuth();

    // Make 6 rapid attempts (MAX_ATTEMPTS is 5)
    for (let i = 0; i < 6; i++) {
      await authorize(
        { email: "brute@example.com", password: "pass" },
        {},
      );
    }

    // The 6th attempt should be blocked by rate limiter,
    // so findUnique should only have been called 5 times
    expect(mockPrisma.user.findUnique).toHaveBeenCalledTimes(5);
  });

  it("rate limiter resets after successful login", async () => {
    const bcrypt = await import("bcryptjs");
    const hash = await bcrypt.hash("pass", 10);

    mockPrisma.user.findUnique.mockResolvedValue({
      id: "1",
      email: "reset@example.com",
      name: "User",
      role: "admin",
      passwordHash: hash,
    });

    const { authorize } = await getAuth();

    // Make 4 failed attempts
    for (let i = 0; i < 4; i++) {
      await authorize(
        { email: "reset@example.com", password: "wrong" },
        {},
      );
    }

    // Successful login should reset counter
    const result = await authorize(
      { email: "reset@example.com", password: "pass" },
      {},
    );
    expect(result).not.toBeNull();
    expect(result?.id).toBe("1");

    // Should be able to make more attempts now
    for (let i = 0; i < 4; i++) {
      await authorize(
        { email: "reset@example.com", password: "wrong" },
        {},
      );
    }
    // All should have reached findUnique (not blocked by rate limiter)
    expect(mockPrisma.user.findUnique).toHaveBeenCalledTimes(9); // 4 wrong + 1 correct + 4 wrong
  });
});

describe("auth config", () => {
  it("uses JWT session strategy", async () => {
    const { authConfig } = await import("@/auth/auth.config");
    expect(authConfig.session?.strategy).toBe("jwt");
  });

  it("uses custom sign-in page", async () => {
    const { authConfig } = await import("@/auth/auth.config");
    expect(authConfig.pages?.signIn).toBe("/admin/login");
  });

  it("authorized callback blocks admin routes without session", async () => {
    const { authConfig } = await import("@/auth/auth.config");
    const authorized = authConfig.callbacks?.authorized as unknown as AuthorizedCallback;

    const result = authorized({
      auth: null,
      request: { nextUrl: { pathname: "/admin/courses" } },
    });
    expect(result).toBe(false);
  });

  it("authorized callback allows admin routes with session", async () => {
    const { authConfig } = await import("@/auth/auth.config");
    const authorized = authConfig.callbacks?.authorized as unknown as AuthorizedCallback;

    const result = authorized({
      auth: { user: { id: "1" } },
      request: { nextUrl: { pathname: "/admin/courses" } },
    });
    expect(result).toBe(true);
  });

  it("authorized callback allows non-admin routes without session", async () => {
    const { authConfig } = await import("@/auth/auth.config");
    const authorized = authConfig.callbacks?.authorized as unknown as AuthorizedCallback;

    const result = authorized({
      auth: null,
      request: { nextUrl: { pathname: "/en/training-courses" } },
    });
    expect(result).toBe(true);
  });

  it("jwt callback adds id and role to token", async () => {
    const { authConfig } = await import("@/auth/auth.config");
    const jwt = authConfig.callbacks?.jwt as unknown as JwtCallback;

    const token = { name: "test" };
    const user = { id: "u1", role: "owner" };

    mockPrisma.user.findUnique.mockResolvedValue({ id: "u1", role: "owner", updatedAt: new Date("2026-01-01") });
    const result = await jwt({ token, user });
    expect(result?.id).toBe("u1");
    expect(result?.role).toBe("owner");
  });

  it("session callback adds id and role to session", async () => {
    const { authConfig } = await import("@/auth/auth.config");
    const session = authConfig.callbacks?.session as unknown as SessionCallback;

    const sess = { user: { name: "test" } };
    const token = { id: "u1", role: "admin" };

    const result = session({ session: sess, token });
    expect(result.user.id).toBe("u1");
    expect((result.user as Record<string, unknown>).role).toBe("admin");
  });
});


describe("session revocation", () => {
  it("rejects deleted users, changed accounts and legacy tokens", async () => {
    const { authConfig } = await import("@/auth/auth.config");
    const jwt = authConfig.callbacks?.jwt as unknown as JwtCallback;
    mockPrisma.user.findUnique.mockResolvedValue(null);
    expect(await jwt({ token: { id: "deleted" } })).toBeNull();
    mockPrisma.user.findUnique.mockResolvedValue({ id: "u1", role: "admin", updatedAt: new Date("2026-02-01") });
    expect(await jwt({ token: { id: "u1", role: "owner", userVersion: "2026-01-01T00:00:00.000Z" } })).toBeNull();
    expect(await jwt({ token: { id: "u1", role: "owner" } })).toBeNull();
    const valid = await jwt({ token: { id: "u1", role: "owner", userVersion: "2026-02-01T00:00:00.000Z" } });
    expect(valid?.role).toBe("admin");
  });
});
