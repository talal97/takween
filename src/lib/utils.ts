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

export function formatDateRange(start: Date, end: Date, locale = "en") {
  const startStr = start.toLocaleDateString(locale === "ar" ? "ar" : "en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const endStr = end.toLocaleDateString(locale === "ar" ? "ar" : "en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const sameYear = start.getFullYear() === end.getFullYear();
  if (sameYear) {
    const sm = start.toLocaleDateString(locale === "ar" ? "ar" : "en-GB", { day: "2-digit", month: "short" });
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