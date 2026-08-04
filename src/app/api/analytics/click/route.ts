import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { element, path, locale, metadata } = body;

    if (!element || typeof element !== "string" || !path || typeof path !== "string") {
      return NextResponse.json({ error: "element and path required" }, { status: 400 });
    }
    if (element.length > 100 || path.length > 500) {
      return NextResponse.json({ error: "payload too long" }, { status: 400 });
    }
    if (!checkRateLimit(`click:${clientIp(req)}`, 120)) {
      return NextResponse.json({ error: "rate limited" }, { status: 429 });
    }

    const l = locale === "ar" ? "ar" : "en";
    const meta: Record<string, string> | undefined =
      metadata && typeof metadata === "object" && !Array.isArray(metadata)
        ? Object.entries(metadata as Record<string, unknown>)
            .filter(([, v]) => typeof v === "string")
            .slice(0, 8)
            .reduce<Record<string, string>>((acc, [k, v]) => {
              acc[k] = v as string;
              return acc;
            }, {})
        : undefined;

    await prisma.clickEvent.create({
      data: {
        element,
        path,
        locale: l,
        metadata: meta,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}
