const WINDOW_MS = 60 * 1000;
type Entry = { count: number; resetAt: number };
const buckets = new Map<string, Entry>();

function pruneExpired(now: number) {
  if (buckets.size < 4096) return;
  for (const [key, entry] of buckets) {
    if (now > entry.resetAt) buckets.delete(key);
  }
}

// In-memory sliding fixed-window limiter. Fine for a single instance; swap for
// Redis/DB when scaling horizontally. Silent-fails open — do not rely on it as
// the only protection layer.
export function checkRateLimit(key: string, max: number): boolean {
  const now = Date.now();
  pruneExpired(now);
  const entry = buckets.get(key);
  if (!entry || now > entry.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  entry.count += 1;
  return entry.count <= max;
}

export function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}
