import { createReadStream } from "fs";
import { statUpload, safeUploadUrl } from "@/lib/uploads";

export const runtime = "nodejs";

const MIME: Record<string, string> = {
  pdf: "application/pdf",
  jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
  webp: "image/webp", gif: "image/gif",
  csv: "text/csv",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  xls: "application/vnd.ms-excel",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  doc: "application/msword",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ppt: "application/vnd.ms-powerpoint",
};

export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const rel = path.join("/");
  if (!safeUploadUrl(rel)) {
    return new Response("Not found", { status: 404 });
  }

  const info = await statUpload(rel);
  if (!info) return new Response("Not found", { status: 404 });

  const ext = rel.split(".").pop()?.toLowerCase() ?? "";
  const headers: Record<string, string> = {
    "Content-Type": MIME[ext] || "application/octet-stream",
    "Content-Length": String(info.size),
    "Cache-Control": "public, max-age=31536000, immutable",
  };

  return new Response(createReadStream(info.full) as unknown as ReadableStream, { headers });
}