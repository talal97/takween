import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { readdir, stat } from "fs/promises";
import path from "path";
import { UPLOAD_DIR } from "@/lib/uploads";

export const runtime = "nodejs";

type MediaFile = {
  name: string;
  url: string;
  size: number;
  type: "image" | "document" | "other";
  modified: string;
};

const IMAGE_EXTS = new Set(["jpg", "jpeg", "png", "webp", "gif"]);
const DOC_EXTS = new Set(["pdf", "doc", "docx", "ppt", "pptx", "xlsx", "xls", "csv"]);

function classify(ext: string): MediaFile["type"] {
  if (IMAGE_EXTS.has(ext)) return "image";
  if (DOC_EXTS.has(ext)) return "document";
  return "other";
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const search = url.searchParams.get("q")?.toLowerCase() || "";
  const typeFilter = url.searchParams.get("type") as "image" | "document" | "other" | null;
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
  const perPage = 48;

  try {
    const entries = await readdir(UPLOAD_DIR);
    const files: MediaFile[] = [];

    for (const name of entries) {
      const full = path.join(UPLOAD_DIR, name);
      const st = await stat(full).catch(() => null);
      if (!st || !st.isFile()) continue;

      const ext = path.extname(name).toLowerCase().replace(".", "");
      const fileType = classify(ext);

      if (search && !name.toLowerCase().includes(search)) continue;
      if (typeFilter && fileType !== typeFilter) continue;

      files.push({
        name,
        url: `/files/${name}`,
        size: st.size,
        type: fileType,
        modified: st.mtime.toISOString(),
      });
    }

    files.sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime());

    const total = files.length;
    const start = (page - 1) * perPage;
    const paged = files.slice(start, start + perPage);

    return NextResponse.json({ files: paged, total, page, perPage });
  } catch {
    return NextResponse.json({ files: [], total: 0, page: 1, perPage });
  }
}
