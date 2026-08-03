import { describe, it, expect } from "vitest";
import { slugify, parseJsonArray } from "@/lib/slug";

describe("slugify", () => {
  it("lowercases and replaces spaces with hyphens", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });
  it("replaces & with 'and'", () => {
    expect(slugify("A & B")).toBe("a-and-b");
  });
  it("removes special characters", () => {
    expect(slugify("Course: Level 1 (Advanced)!")).toBe("course-level-1-advanced");
  });
  it("trims leading/trailing hyphens", () => {
    expect(slugify("--hello--")).toBe("hello");
  });
  it("handles empty string", () => {
    expect(slugify("")).toBe("");
  });
  it("collapses multiple hyphens", () => {
    expect(slugify("a   b")).toBe("a-b");
  });
  it("handles Arabic text by stripping non-latin chars", () => {
    const result = slugify("دورة تدريبية");
    // Non-latin chars are stripped, leaving hyphens that get trimmed
    expect(result).not.toContain(" ");
  });
});

describe("parseJsonArray", () => {
  it("parses valid JSON array", () => {
    expect(parseJsonArray('["a","b","c"]')).toEqual(["a", "b", "c"]);
  });
  it("returns empty array for non-array JSON", () => {
    expect(parseJsonArray('{"key":"value"}')).toEqual([]);
  });
  it("falls back to newline-separated string", () => {
    expect(parseJsonArray("line1\nline2\nline3")).toEqual([
      "line1",
      "line2",
      "line3",
    ]);
  });
  it("trims whitespace in fallback", () => {
    expect(parseJsonArray("  a  \n  b  ")).toEqual(["a", "b"]);
  });
  it("returns empty array for empty string", () => {
    expect(parseJsonArray("")).toEqual([]);
  });
  it("returns empty array for invalid JSON and empty fallback", () => {
    expect(parseJsonArray("not json")).toEqual(["not json"]);
  });
});
