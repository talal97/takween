export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFC")
    .replace(/&/g, "and")
    .replace(/[^\p{L}\p{N}\p{M}]+/gu, "-")
    .replace(/(^-|-$)/g, "");
}

export function parseJsonArray(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return value ? value.split("\n").map((s) => s.trim()).filter(Boolean) : [];
  }
}
