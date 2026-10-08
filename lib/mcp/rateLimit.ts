// One constant-size process bucket. Forwarded headers never identify clients.
export function createRateLimit(
  capacity = 120,
  perMinute = 120,
  now = Date.now
) {
  let tokens = capacity
  let previous = now()
  return () => {
    const current = now()
    tokens = Math.min(
      capacity,
      tokens + (Math.max(0, current - previous) * perMinute) / 60000
    )
    previous = Math.max(previous, current)
    if (tokens < 1)
      return {
        allowed: false,
        retryAfter: Math.ceil(((1 - tokens) * 60) / perMinute),
      }
    tokens -= 1
    return { allowed: true, retryAfter: 0 }
  }
}
