// Global test setup — mock modules that don't work in vitest's node environment

import { vi } from "vitest";

// Mock next/cache revalidation (no-op in tests)
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

// Mock next/navigation redirect (throws so we can assert it was called)
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
  notFound: vi.fn(() => {
    throw new Error("NOT_FOUND");
  }),
}));

// Mock next/headers cookies
vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: vi.fn(() => undefined),
    set: vi.fn(),
  })),
}));
