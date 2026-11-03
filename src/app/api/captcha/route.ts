import { NextResponse } from "next/server";
import svgCaptcha from "svg-captcha";
import { encryptCaptcha } from "@/lib/captcha";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET() {
  if (!checkRateLimit("captcha-global", 120)) return new NextResponse("Too many requests", { status: 429 });
  // svg-captcha renders glyph outlines, rather than exposing answers in text nodes.
  const challenge = svgCaptcha.create({ size: 5, noise: 3, color: true, background: "#f8fafc", ignoreChars: "0oO1ilI" });
  const res = new NextResponse(challenge.data, {
    headers: { "Content-Type": "image/svg+xml", "Cache-Control": "no-store" },
  });
  res.cookies.set("takween_captcha", encryptCaptcha(challenge.text.toLowerCase()), {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 600,
  });
  return res;
}
