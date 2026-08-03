import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { path, locale, referrer } = body;

    if (!path || typeof path !== "string") {
      return NextResponse.json({ error: "path required" }, { status: 400 });
    }

    await prisma.pageView.create({
      data: {
        path,
        locale: locale || "en",
        referrer: referrer || null,
        userAgent: req.headers.get("user-agent")?.slice(0, 500) || null,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}
