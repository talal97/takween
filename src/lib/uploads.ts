import { mkdir } from "fs/promises";
import path from "path";
import fsp from "fs/promises";
import crypto from "crypto";

export const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), "data");

export const ALLOWED_EXT = [
  "jpg", "jpeg", "png", "webp", "gif",
  "pdf", "xlsx", "xls", "csv", "doc", "docx", "ppt", "pptx",
];

export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024; // 25 MB

export const MIME_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
  webp: "image/webp", gif: "image/gif",
  pdf: "application/pdf", csv: "text/csv",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  xls: "application/vnd.ms-excel",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
};

export async function ensureUploadDir() {
  await mkdir(UPLOAD_DIR, { recursive: true });
}

export function safeExt(filename: string): string | null {
  const ext = path.extname(filename).toLowerCase().replace(".", "");
  return ALLOWED_EXT.includes(ext) ? ext : null;
}

export function safeJoin(relPath: string): string | null {
  const base = path.resolve(UPLOAD_DIR);
  const full = path.resolve(UPLOAD_DIR, relPath);
  if (full !== base && !full.startsWith(base + path.sep)) return null;
  return full;
}

export function safeUploadUrl(relPath: string): string | null {
  if (!relPath || relPath.startsWith("/") || /^[a-z]+:\/\//i.test(relPath)) return null;
  return safeJoin(relPath);
}

export function contentTypeFor(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase().replace(".", "");
  return MIME_BY_EXT[ext] || "application/octet-stream";
}

export async function saveUpload(buffer: Buffer, originalName: string): Promise<string> {
  await ensureUploadDir();
  const ext = safeExt(originalName) || "bin";
  const unique = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}.${ext}`;
  await fsp.writeFile(path.join(UPLOAD_DIR, unique), buffer);
  return `/files/${unique}`;
}

export async function statUpload(relPath: string) {
  const full = safeUploadUrl(relPath);
  if (!full) return null;
  try {
    const st = await fsp.stat(full);
    if (!st.isFile()) return null;
    return { full, size: st.size };
  } catch {
    return null;
  }
}