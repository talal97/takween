import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { path, locale, referrer } = body;

    if (!path || typeof path !== "string") {
      return NextResponse.json({ error: "path required" }, { status: 400 });
    }
    if (path.length > 500) {
      return NextResponse.json({ error: "path too long" }, { status: 400 });
    }
    if (!checkRateLimit(`pageview:${clientIp(req)}`, 240)) {
      return NextResponse.json({ error: "rate limited" }, { status: 429 });
    }

    const l = locale === "ar" ? "ar" : "en";
    const ref = typeof referrer === "string" ? referrer.slice(0, 500) : null;

    await prisma.pageView.create({
      data: {
        path,
        locale: l,
        referrer: ref,
        userAgent: req.headers.get("user-agent")?.slice(0, 500) || null,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}
