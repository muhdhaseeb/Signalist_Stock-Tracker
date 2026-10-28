interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

/**
 * In-memory sliding rate limiter.
 * @param key unique identifier (e.g. IP + endpoint)
 * @param limit maximum requests allowed in interval
 * @param windowMs window time in milliseconds
 */
export function rateLimit(key: string, limit = 10, windowMs = 60 * 1000): {
  success: boolean;
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetAt) {
    const newRecord: RateLimitRecord = {
      count: 1,
      resetAt: now + windowMs,
    };
    rateLimitStore.set(key, newRecord);
    return {
      success: true,
      remaining: limit - 1,
      resetAt: newRecord.resetAt,
    };
  }

  if (record.count >= limit) {
    return {
      success: false,
      remaining: 0,
      resetAt: record.resetAt,
    };
  }

  record.count += 1;
  return {
    success: true,
    remaining: limit - record.count,
    resetAt: record.resetAt,
  };
}
