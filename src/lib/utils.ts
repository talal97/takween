import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "USD") {
  return Number(amount).toLocaleString("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  });
}

export function formatDateRange(start: Date | string, end: Date | string, locale = "en") {
  const s = new Date(start);
  const e = new Date(end);
  const startStr = s.toLocaleDateString(locale === "ar" ? "ar" : "en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const endStr = e.toLocaleDateString(locale === "ar" ? "ar" : "en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const sameYear = s.getFullYear() === e.getFullYear();
  if (sameYear) {
    const sm = s.toLocaleDateString(locale === "ar" ? "ar" : "en-GB", { day: "2-digit", month: "short" });
    return `${sm} - ${endStr}`;
  }
  return `${startStr} - ${endStr}`;
}

export function readableDate(d: Date | string, locale = "en") {
  return new Date(d).toLocaleDateString(locale === "ar" ? "ar" : "en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function isoToFlag(iso: string): string {
  if (!iso || iso.length !== 2) return "";
  const codePoints = [...iso.toUpperCase()].map((c) => 0x1f1e6 - 65 + c.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

/**
 * Parse simple markdown-like page content into React-ready blocks.
 * Format: "## Heading\n\nParagraph text\n\n## Next heading\n\nMore text"
 * Returns an array of { type: "heading" | "paragraph", text: string }.
 */
export function parsePageContent(raw: string): Array<{ type: "heading" | "paragraph"; text: string }> {
  if (!raw?.trim()) return [];
  return raw
    .split(/\n\n+/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      if (block.startsWith("## ")) {
        return { type: "heading" as const, text: block.slice(3) };
      }
      return { type: "paragraph" as const, text: block.replace(/\n/g, " ") };
    });
}