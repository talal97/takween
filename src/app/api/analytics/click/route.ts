import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { element, path, locale, metadata } = body;

    if (!element || typeof element !== "string" || !path || typeof path !== "string") {
      return NextResponse.json({ error: "element and path required" }, { status: 400 });
    }

    await prisma.clickEvent.create({
      data: {
        element,
        path,
        locale: locale || "en",
        metadata: metadata || undefined,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}
