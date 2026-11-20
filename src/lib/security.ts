import { NextRequest, NextResponse } from "next/server";

/**
 * Lightweight in-memory rate limiter for public forms.
 * Per-IP per-action token bucket — protects against simple spam/abuse.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000; // 1 minute
const MAX = 5; // 5 requests per minute per action+ip

export function rateLimit(req: NextRequest, action: string): { ok: boolean; remaining: number; retryAfterSec: number } {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  const key = `${action}:${ip}`;
  const now = Date.now();
  const cur = buckets.get(key);
  if (!cur || cur.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true, remaining: MAX - 1, retryAfterSec: 60 };
  }
  cur.count += 1;
  if (cur.count > MAX) {
    const retryAfterSec = Math.ceil((cur.resetAt - now) / 1000);
    return { ok: false, remaining: 0, retryAfterSec };
  }
  return { ok: true, remaining: MAX - cur.count, retryAfterSec: 60 };
}

export function rateLimitResponse(retryAfterSec: number) {
  return NextResponse.json(
    { ok: false, error: "Too many requests. Please try again shortly." },
    { status: 429, headers: { "Retry-After": String(retryAfterSec) } }
  );
}

/**
 * Basic honeypot + field validation helpers.
 * Returns null if valid, or an error message string.
 */
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

export function sanitize(s: string, maxLen = 5000): string {
  return s.slice(0, maxLen).replace(/\u0000/g, "");
}

export function checkHoneypot(body: Record<string, any>): boolean {
  // honeypot field is `company_url` (hidden from real users); if filled, it's a bot
  return !body.company_url;
}
