import "server-only";

type Bucket = {
  count: number;
  resetAt: number;
};

type LimitOptions = {
  scope: string;
  limit: number;
  windowMs: number;
};

type LimitResult = {
  limited: boolean;
  remaining: number;
  resetAt: number;
  backend: "memory" | "upstash";
};

const buckets = new Map<string, Bucket>();

function clientKey(request: Request, scope: string) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  const userAgent = request.headers.get("user-agent")?.slice(0, 80) || "unknown";
  return `${scope}:${forwarded || realIp || "local"}:${userAgent}`;
}

async function checkUpstashRateLimit(key: string, options: LimitOptions): Promise<LimitResult | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const resetAt = Date.now() + options.windowMs;
  const ttlSeconds = Math.max(1, Math.ceil(options.windowMs / 1000));
  const encodedKey = encodeURIComponent(`leela:rate:${key}`);
  const headers = { Authorization: `Bearer ${token}` };

  try {
    const increment = await fetch(`${url}/incr/${encodedKey}`, { headers, cache: "no-store" });
    if (!increment.ok) return null;
    const incrementData = await increment.json() as { result?: unknown };
    const count = typeof incrementData.result === "number" ? incrementData.result : Number(incrementData.result);
    if (!Number.isFinite(count)) return null;

    if (count === 1) {
      await fetch(`${url}/expire/${encodedKey}/${ttlSeconds}`, { headers, cache: "no-store" }).catch(() => null);
    }

    return {
      limited: count > options.limit,
      remaining: Math.max(0, options.limit - count),
      resetAt,
      backend: "upstash",
    };
  } catch {
    return null;
  }
}

function checkMemoryRateLimit(key: string, options: LimitOptions): LimitResult {
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + options.windowMs });
    return { limited: false, remaining: options.limit - 1, resetAt: now + options.windowMs, backend: "memory" };
  }

  if (current.count >= options.limit) {
    return { limited: true, remaining: 0, resetAt: current.resetAt, backend: "memory" };
  }

  current.count += 1;
  return { limited: false, remaining: options.limit - current.count, resetAt: current.resetAt, backend: "memory" };
}

export async function checkRateLimit(request: Request, options: LimitOptions): Promise<LimitResult> {
  const key = clientKey(request, options.scope);
  return await checkUpstashRateLimit(key, options) || checkMemoryRateLimit(key, options);
}

export function rateLimitHeaders(result: { remaining: number; resetAt: number }) {
  return {
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
  };
}
