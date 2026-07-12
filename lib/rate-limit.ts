// In-memory rate limiter — resets on server restart and does not share state
// across multiple instances. For production multi-instance deployments, replace
// with Redis or a similar persistent store.
const orderAttempts = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(ip: string, max = 5, windowMs = 3600000): boolean {
  const now = Date.now();
  const entry = orderAttempts.get(ip);

  if (!entry || now > entry.resetAt) {
    orderAttempts.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= max) return false;

  entry.count++;
  return true;
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}
