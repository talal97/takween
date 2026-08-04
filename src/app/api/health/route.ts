import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const dbOk = await prisma.$queryRaw`SELECT 1`;
    const dbConnected = Array.isArray(dbOk) && dbOk.length > 0;

    return NextResponse.json({
      status: dbConnected ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      database: dbConnected ? "connected" : "disconnected",
    });
  } catch (err) {
    console.error("Health check failed:", err);
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        database: "error",
      },
      { status: 503 },
    );
  }
}
