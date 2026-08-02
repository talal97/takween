import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { saveUpload, safeExt, MAX_UPLOAD_BYTES } from "@/lib/uploads";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const entries = Array.from(formData.entries());
  const files = entries.filter(([, v]) => v instanceof File) as Array<[string, File]>;
  if (files.length === 0) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }

  const out: Array<{ field: string; url: string }> = [];

  for (const [field, file] of files) {
    if (!safeExt(file.name)) {
      return NextResponse.json({ error: `Unsupported file type: ${file.name}` }, { status: 400 });
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: `File too large: ${file.name}` }, { status: 413 });
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await saveUpload(buffer, file.name);
    out.push({ field, url });
  }

  return NextResponse.json({ urls: out });
}