import "server-only";

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

function clientKey(request: Request, scope: string) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  const userAgent = request.headers.get("user-agent")?.slice(0, 80) || "unknown";
  return `${scope}:${forwarded || realIp || "local"}:${userAgent}`;
}

export function checkRateLimit(request: Request, options: {
  scope: string;
  limit: number;
  windowMs: number;
}) {
  const now = Date.now();
  const key = clientKey(request, options.scope);
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + options.windowMs });
    return { limited: false, remaining: options.limit - 1, resetAt: now + options.windowMs };
  }

  if (current.count >= options.limit) {
    return { limited: true, remaining: 0, resetAt: current.resetAt };
  }

  current.count += 1;
  return { limited: false, remaining: options.limit - current.count, resetAt: current.resetAt };
}

export function rateLimitHeaders(result: { remaining: number; resetAt: number }) {
  return {
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
  };
}
