import crypto from "crypto";

const key = crypto.createHash("sha256").update(process.env.AUTH_SECRET || "dev-secret").digest();

export function encryptCaptcha(text: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64url")}.${tag.toString("base64url")}.${enc.toString("base64url")}`;
}

export function decryptCaptcha(token: string): string | null {
  try {
    const [ivb, tagb, encb] = token.split(".");
    if (!ivb || !tagb || !encb) return null;
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(ivb, "base64url"));
    decipher.setAuthTag(Buffer.from(tagb, "base64url"));
    return Buffer.concat([decipher.update(Buffer.from(encb, "base64url")), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}