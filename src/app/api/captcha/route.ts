import { NextResponse } from "next/server";
import crypto from "crypto";
import { encryptCaptcha } from "@/lib/captcha";

const ALPHABET = "ABCDEFGHKMNPQRSTUVWXYZabcdefghkmnpqrsuvwxyz23456789";

export async function GET() {
  const len = 5;
  let text = "";
  const bytes = crypto.randomBytes(len);
  for (let i = 0; i < len; i++) text += ALPHABET[bytes[i] % ALPHABET.length];

  const w = 140;
  const h = 44;
  const chars = text.toUpperCase().split("");
  const colors = ["#1d4ed8", "#b91c1c", "#047857", "#7c3aed", "#0f766e"];
  const parts: string[] = [];

  for (let i = 0; i < 6; i++) {
    parts.push(
      `<line x1="${Math.random() * w}" y1="${Math.random() * h}" x2="${Math.random() * w}" y2="${Math.random() * h}" stroke="#cbd5e1" stroke-width="1"/>`,
    );
  }
  for (let i = 0; i < 40; i++) {
    parts.push(
      `<circle cx="${Math.random() * w}" cy="${Math.random() * h}" r="1" fill="#94a3b8" opacity="0.5"/>`,
    );
  }
  chars.forEach((c, i) => {
    const dx = 14 + i * 24;
    const dy = 18 + Math.random() * 16;
    const rot = (Math.random() - 0.5) * 0.7;
    parts.push(
      `<text x="${dx}" y="${dy}" fill="${colors[i % colors.length]}" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="bold" transform="rotate(${rot}, ${dx}, ${dy})">${c}</text>`,
    );
  });

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="#f8fafc"/>${parts.join("")}</svg>`;

  const res = new NextResponse(svg, {
    headers: { "Content-Type": "image/svg+xml", "Cache-Control": "no-store" },
  });
  res.cookies.set("takween_captcha", encryptCaptcha(text.toLowerCase()), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return res;
}