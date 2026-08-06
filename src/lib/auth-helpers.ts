import { cookies } from "next/headers";

/**
 * Clear the NextAuth session cookie when it can't be decoded
 * (e.g. AUTH_SECRET changed since the cookie was issued).
 */
export async function clearStaleSessionCookie() {
  const jar = await cookies();
  jar.set("authjs.session-token", "", { path: "/", maxAge: 0 });
  jar.set("__Secure-authjs.session-token", "", { path: "/", maxAge: 0 });
}
