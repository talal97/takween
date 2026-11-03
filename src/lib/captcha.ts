import crypto from "crypto";

const key = crypto.createHash("sha256").update(process.env.AUTH_SECRET || "dev-secret").digest();

export function encryptCaptcha(text: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(JSON.stringify({ text, expiresAt: Date.now() + 600_000 }), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64url")}.${tag.toString("base64url")}.${enc.toString("base64url")}`;
}

export function decryptCaptcha(token: string): string | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3 || parts.some((part) => !/^[A-Za-z0-9_-]+$/.test(part) || Buffer.from(part, "base64url").toString("base64url") !== part)) return null;
    const [ivb, tagb, encb] = parts;
    if (!ivb || !tagb || !encb) return null;
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(ivb, "base64url"));
    decipher.setAuthTag(Buffer.from(tagb, "base64url"));
    const payload = JSON.parse(Buffer.concat([decipher.update(Buffer.from(encb, "base64url")), decipher.final()]).toString("utf8"));
    if (typeof payload.text !== "string" || typeof payload.expiresAt !== "number" || payload.expiresAt <= Date.now()) return null;
    return payload.text;
  } catch {
    return null;
  }
}
