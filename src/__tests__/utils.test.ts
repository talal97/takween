import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  formatDateRange,
  readableDate,
  isoToFlag,
  cn,
} from "@/lib/utils";

describe("cn", () => {
  it("merges tailwind classes", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });
  it("handles falsy values", () => {
    expect(cn("text-red-500", false, null, undefined)).toBe("text-red-500");
  });
});

describe("formatCurrency", () => {
  it("formats USD by default", () => {
    const result = formatCurrency(1234);
    expect(result).toContain("1,234");
    expect(result).toContain("$");
  });
  it("formats with specific currency", () => {
    const result = formatCurrency(500, "EUR");
    expect(result).toContain("500");
    expect(result).toContain("€");
  });
  it("handles zero", () => {
    expect(formatCurrency(0)).toContain("0");
  });
});

describe("formatDateRange", () => {
  it("formats same-year range in English", () => {
    const result = formatDateRange(
      new Date("2025-03-10"),
      new Date("2025-03-14"),
      "en",
    );
    expect(result).toContain("10");
    expect(result).toContain("14");
    expect(result).toContain("Mar");
    expect(result).toContain(" - ");
  });
  it("formats cross-year range in English", () => {
    const result = formatDateRange(
      new Date("2025-12-30"),
      new Date("2026-01-05"),
      "en",
    );
    expect(result).toContain("2025");
    expect(result).toContain("2026");
  });
  it("accepts string dates", () => {
    const result = formatDateRange("2025-06-01", "2025-06-03", "en");
    expect(result).toContain("01");
    expect(result).toContain("03");
    expect(result).toContain("Jun");
  });
  it("formats in Arabic locale", () => {
    const result = formatDateRange(
      new Date("2025-03-10"),
      new Date("2025-03-14"),
      "ar",
    );
    expect(result).toContain(" - ");
  });
});

describe("readableDate", () => {
  it("formats a date in English", () => {
    const result = readableDate(new Date("2025-07-04"), "en");
    expect(result).toContain("04");
    expect(result).toContain("Jul");
    expect(result).toContain("2025");
  });
  it("accepts string input", () => {
    const result = readableDate("2025-01-15", "en");
    expect(result).toContain("15");
    expect(result).toContain("Jan");
  });
});

describe("isoToFlag", () => {
  it("converts 2-letter ISO to flag emoji", () => {
    expect(isoToFlag("US")).toBe("🇺🇸");
    expect(isoToFlag("SA")).toBe("🇸🇦");
    expect(isoToFlag("GB")).toBe("🇬🇧");
  });
  it("handles lowercase input", () => {
    expect(isoToFlag("ae")).toBe("🇦🇪");
  });
  it("returns empty for invalid input", () => {
    expect(isoToFlag("")).toBe("");
    expect(isoToFlag("A")).toBe("");
    expect(isoToFlag("ABC")).toBe("");
  });
});
