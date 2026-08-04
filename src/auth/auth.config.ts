import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// Refuse to run with the placeholder secret in production.
if (
  process.env.NODE_ENV === "production" &&
  (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32)
) {
  throw new Error(
    "AUTH_SECRET must be set to a strong random value (>=32 chars) in production. " +
    "Generate with: openssl rand -base64 32",
  );
}

// Simple in-memory brute-force protection. Not shared across instances —
// fine for a single admin host, but replace with Redis/DB for multi-instance.
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
type Attempt = { count: number; resetAt: number };
const attempts = new Map<string, Attempt>();

function pruneExpired(now: number) {
  // Sweep expired entries occasionally so the in-memory map cannot grow
  // unbounded on a long-running instance.
  if (attempts.size < 1024) return;
  for (const [key, entry] of attempts) {
    if (now > entry.resetAt) attempts.delete(key);
  }
}

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  pruneExpired(now);
  const entry = attempts.get(key);
  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  entry.count += 1;
  return entry.count <= MAX_ATTEMPTS;
}

export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const key = email.toLowerCase();
        if (!checkRateLimit(key)) {
          // Keep the failure response identical to a bad password to avoid
          // leaking whether an account exists.
          return null;
        }

        const user = await prisma.user.findUnique({ where: { email: key } });
        if (!user || !user.passwordHash) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        // Successful login clears the attempt counter for this account.
        attempts.delete(key);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const isAdminRoute =
        request.nextUrl.pathname.startsWith("/admin") ||
        request.nextUrl.pathname.startsWith("/ar/admin") ||
        request.nextUrl.pathname.startsWith("/en/admin");
      if (isAdminRoute) return isLoggedIn;
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
};