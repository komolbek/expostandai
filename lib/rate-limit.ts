// Simple in-memory rate limiter for API routes

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key)
    }
  }
}, 5 * 60 * 1000)

export interface RateLimitConfig {
  maxRequests: number // Max requests allowed in the window
  windowMs: number // Time window in milliseconds
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetTime: number
}

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now()
  const key = identifier

  const entry = rateLimitStore.get(key)

  if (!entry || entry.resetTime < now) {
    // New window
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    })
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetTime: now + config.windowMs,
    }
  }

  if (entry.count >= config.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetTime: entry.resetTime,
    }
  }

  entry.count++
  return {
    success: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  }
}

// Predefined rate limit configs
export const RATE_LIMITS = {
  // Login: 5 attempts per 15 minutes
  login: { maxRequests: 5, windowMs: 15 * 60 * 1000 },
  // Image generation: 2 requests per hour (per-user limit also enforced in db)
  imageGeneration: { maxRequests: 2, windowMs: 60 * 60 * 1000 },
  // Form submission: 20 requests per hour
  formSubmission: { maxRequests: 20, windowMs: 60 * 60 * 1000 },
  // General API: 100 requests per minute
  general: { maxRequests: 100, windowMs: 60 * 1000 },
}

// Helper to get client IP from request
export function getClientIp(request: Request): string {
  // Check common headers for proxied requests
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  // Fallback - in production behind a proxy, this should rarely be used
  return 'unknown'
}
