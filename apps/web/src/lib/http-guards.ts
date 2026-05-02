import { createHash } from "node:crypto";

const buckets = new Map<string, { count: number; resetAt: number }>();

export function clientKey(request: Request, scope: string): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const raw = `${scope}:${forwarded || request.headers.get("x-real-ip") || "local"}`;
  return createHash("sha256").update(raw).digest("hex").slice(0, 24);
}

export function rateLimit(key: string, limit: number, windowMs: number): { ok: true } | { ok: false; retryAfter: number } {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }
  if (bucket.count >= limit) return { ok: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
  bucket.count += 1;
  return { ok: true };
}

export async function readJsonWithLimit(request: Request, maxBytes = 12_000): Promise<unknown> {
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > maxBytes) throw new PayloadTooLargeError(maxBytes);
  const text = await request.text();
  if (new TextEncoder().encode(text).length > maxBytes) throw new PayloadTooLargeError(maxBytes);
  return text ? JSON.parse(text) : {};
}

export class PayloadTooLargeError extends Error {
  constructor(readonly maxBytes: number) {
    super(`Payload exceeds ${maxBytes} bytes`);
  }
}

export function rateLimitResponse(retryAfter: number): Response {
  return Response.json({ error: "Too many requests", retryAfter }, { status: 429, headers: { "retry-after": String(retryAfter) } });
}

export function payloadTooLargeResponse(error: PayloadTooLargeError): Response {
  return Response.json({ error: "Payload too large", maxBytes: error.maxBytes }, { status: 413 });
}
