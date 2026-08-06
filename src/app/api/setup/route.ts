import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

/**
 * One-time setup route — seeds the admin user and fixes password.
 * DELETE this route after first use in production.
 *
 * GET /api/setup           → shows status / creates admin
 * POST /api/setup          → resets admin password to ADMIN_PASSWORD env or 67655097Tt@
 */
export async function GET() {
  const users = await prisma.user.findMany({ select: { id: true, email: true, role: true } });

  if (users.length === 0) {
    const email = process.env.ADMIN_EMAIL || "talamahmood97@gmail.com";
    const password = process.env.ADMIN_PASSWORD || "67655097Tt@";
    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: { email, passwordHash, name: "Talal", role: "owner" },
    });

    return NextResponse.json({ ok: true, action: "created", email });
  }

  return NextResponse.json({ ok: true, action: "already_exists", users });
}

export async function POST() {
  const email = "talamahmood97@gmail.com";
  const password = "67655097Tt@";
  const passwordHash = await bcrypt.hash(password, 10);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    await prisma.user.update({ where: { email }, data: { passwordHash } });
    return NextResponse.json({ ok: true, action: "password_reset", email });
  }

  await prisma.user.create({
    data: { email, passwordHash, name: "Talal", role: "owner" },
  });
  return NextResponse.json({ ok: true, action: "created", email });
}
