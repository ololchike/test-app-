/**
 * Rate Limiting Utility
 * Implements token bucket algorithm for API rate limiting
 *
 * SECURITY: Prevents brute force attacks, DDoS, and abuse
 */

interface RateLimitConfig {
  uniqueTokenPerInterval?: number
  interval?: number
}

interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

export class RateLimiter {
  private tokenCache: Map<string, { tokens: number; lastRefill: number }>
  private uniqueTokenPerInterval: number
  private interval: number

  constructor(config: RateLimitConfig = {}) {
    this.tokenCache = new Map()
    this.uniqueTokenPerInterval = config.uniqueTokenPerInterval || 10
    this.interval = config.interval || 60000 // 1 minute default
  }

  private refillTokens(identifier: string): void {
    const now = Date.now()
    const tokenData = this.tokenCache.get(identifier)

    if (!tokenData) {
      this.tokenCache.set(identifier, {
        tokens: this.uniqueTokenPerInterval,
        lastRefill: now,
      })
      return
    }

    const timePassed = now - tokenData.lastRefill
    const refillAmount = Math.floor(
      (timePassed / this.interval) * this.uniqueTokenPerInterval
    )

    if (refillAmount > 0) {
      tokenData.tokens = Math.min(
        this.uniqueTokenPerInterval,
        tokenData.tokens + refillAmount
      )
      tokenData.lastRefill = now
    }
  }

  check(identifier: string): RateLimitResult {
    this.refillTokens(identifier)
    const tokenData = this.tokenCache.get(identifier)!
    const now = Date.now()

    const reset = tokenData.lastRefill + this.interval

    if (tokenData.tokens > 0) {
      tokenData.tokens--
      return {
        success: true,
        limit: this.uniqueTokenPerInterval,
        remaining: tokenData.tokens,
        reset,
      }
    }

    return {
      success: false,
      limit: this.uniqueTokenPerInterval,
      remaining: 0,
      reset,
    }
  }

  // Clean up old entries periodically
  cleanup(): void {
    const now = Date.now()
    for (const [identifier, data] of this.tokenCache.entries()) {
      if (now - data.lastRefill > this.interval * 2) {
        this.tokenCache.delete(identifier)
      }
    }
  }
}

// Predefined rate limiters for different endpoint types
export const rateLimiters = {
  // Strict limits for authentication endpoints (10 requests per 15 minutes)
  auth: new RateLimiter({
    uniqueTokenPerInterval: 10,
    interval: 15 * 60 * 1000, // 15 minutes
  }),

  // Moderate limits for API endpoints (100 requests per minute)
  api: new RateLimiter({
    uniqueTokenPerInterval: 100,
    interval: 60 * 1000, // 1 minute
  }),

  // Strict limits for payment initiation (5 requests per minute)
  payment: new RateLimiter({
    uniqueTokenPerInterval: 5,
    interval: 60 * 1000, // 1 minute
  }),

  // Very strict limits for webhook endpoints (50 per minute from trusted sources)
  webhook: new RateLimiter({
    uniqueTokenPerInterval: 50,
    interval: 60 * 1000, // 1 minute
  }),

  // Strict limits for admin actions (30 requests per minute)
  admin: new RateLimiter({
    uniqueTokenPerInterval: 30,
    interval: 60 * 1000, // 1 minute
  }),
}

// Cleanup interval - run every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    Object.values(rateLimiters).forEach(limiter => limiter.cleanup())
  }, 10 * 60 * 1000)
}

/**
 * Get client identifier from request
 * Uses IP address and optionally user ID for authenticated requests
 */
export function getClientIdentifier(request: Request, userId?: string): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown"

  // Combine IP with user ID for authenticated requests
  return userId ? `${ip}-${userId}` : ip
}

/**
 * Apply rate limiting to a request
 */
export function applyRateLimit(
  identifier: string,
  limiter: RateLimiter = rateLimiters.api
): RateLimitResult {
  return limiter.check(identifier)
}
