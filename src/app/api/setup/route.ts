import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

/**
 * One-time setup route — seeds the admin user if no users exist.
 * DELETE this route after first use in production.
 *
 * GET /api/setup  → shows status / creates admin
 */
export async function GET() {
  const userCount = await prisma.user.count();

  if (userCount > 0) {
    return NextResponse.json({
      ok: true,
      message: "Admin user already exists. Delete this route for security.",
      users: userCount,
    });
  }

  const email = process.env.ADMIN_EMAIL || "talamahmood97@gmail.com";
  const password = process.env.ADMIN_PASSWORD || "67655097Tt@";

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: "Talal",
      role: "owner",
    },
  });

  return NextResponse.json({
    ok: true,
    message: `Admin user created: ${email}. DELETE /api/setup for security!`,
  });
}
