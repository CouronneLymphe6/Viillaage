import { NextRequest, NextResponse } from 'next/server';

/**
 * Simple in-memory rate limiter
 * For production, consider using Redis with @upstash/ratelimit
 */

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

class RateLimiter {
    private store: Map<string, RateLimitEntry> = new Map();
    private cleanupInterval: NodeJS.Timeout;

    constructor() {
        // Cleanup expired entries every 5 minutes
        this.cleanupInterval = setInterval(() => {
            this.cleanup();
        }, 5 * 60 * 1000);
    }

    private cleanup() {
        const now = Date.now();
        for (const [key, entry] of this.store.entries()) {
            if (entry.resetTime < now) {
                this.store.delete(key);
            }
        }
    }

    /**
     * Check if request should be rate limited
     * @param identifier - Unique identifier (IP, user ID, etc.)
     * @param limit - Maximum number of requests
     * @param windowMs - Time window in milliseconds
     * @returns true if rate limit exceeded
     */
    isRateLimited(identifier: string, limit: number, windowMs: number): boolean {
        const now = Date.now();
        const entry = this.store.get(identifier);

        if (!entry || entry.resetTime < now) {
            // New window
            this.store.set(identifier, {
                count: 1,
                resetTime: now + windowMs
            });
            return false;
        }

        if (entry.count >= limit) {
            return true;
        }

        entry.count++;
        return false;
    }

    /**
     * Get remaining requests for identifier
     */
    getRemaining(identifier: string, limit: number): number {
        const entry = this.store.get(identifier);
        if (!entry || entry.resetTime < Date.now()) {
            return limit;
        }
        return Math.max(0, limit - entry.count);
    }

    /**
     * Get reset time for identifier
     */
    getResetTime(identifier: string): number | null {
        const entry = this.store.get(identifier);
        return entry?.resetTime || null;
    }
}

// Global rate limiter instance
const rateLimiter = new RateLimiter();

/**
 * Rate limit configurations for different endpoints
 */
export const RATE_LIMITS = {
    // Authentication endpoints
    LOGIN: { limit: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
    REGISTER: { limit: 3, windowMs: 60 * 60 * 1000 }, // 3 registrations per hour

    // API endpoints
    API_DEFAULT: { limit: 100, windowMs: 60 * 1000 }, // 100 requests per minute
    API_STRICT: { limit: 30, windowMs: 60 * 1000 }, // 30 requests per minute

    // Upload endpoints
    UPLOAD: { limit: 10, windowMs: 60 * 60 * 1000 }, // 10 uploads per hour

    // Content creation
    CREATE_ALERT: { limit: 20, windowMs: 60 * 60 * 1000 }, // 20 alerts per hour
    CREATE_MESSAGE: { limit: 60, windowMs: 60 * 1000 }, // 60 messages per minute
    CREATE_EVENT: { limit: 10, windowMs: 60 * 60 * 1000 }, // 10 events per hour
    CREATE_LISTING: { limit: 20, windowMs: 60 * 60 * 1000 }, // 20 listings per hour
} as const;

/**
 * Get client identifier from request
 */
function getClientIdentifier(request: NextRequest, userId?: string): string {
    // Prefer user ID if authenticated
    if (userId) {
        return `user:${userId}`;
    }

    // Fallback to IP address
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
    return `ip:${ip}`;
}

/**
 * Rate limit middleware for API routes
 */
export function rateLimit(
    config: { limit: number; windowMs: number }
) {
    return async (
        request: NextRequest,
        userId?: string
    ): Promise<NextResponse | null> => {
        const identifier = getClientIdentifier(request, userId);
        const isLimited = rateLimiter.isRateLimited(
            identifier,
            config.limit,
            config.windowMs
        );

        if (isLimited) {
            const resetTime = rateLimiter.getResetTime(identifier);
            const retryAfter = resetTime ? Math.ceil((resetTime - Date.now()) / 1000) : 60;

            return NextResponse.json(
                {
                    error: 'Trop de requêtes. Veuillez réessayer plus tard.',
                    retryAfter
                },
                {
                    status: 429,
                    headers: {
                        'Retry-After': retryAfter.toString(),
                        'X-RateLimit-Limit': config.limit.toString(),
                        'X-RateLimit-Remaining': '0',
                        'X-RateLimit-Reset': resetTime?.toString() || ''
                    }
                }
            );
        }

        // Add rate limit headers to response
        const remaining = rateLimiter.getRemaining(identifier, config.limit);
        const resetTime = rateLimiter.getResetTime(identifier);

        return null; // No rate limit, continue
    };
}

/**
 * Helper to apply rate limiting in API routes
 */
export async function checkRateLimit(
    request: NextRequest,
    config: { limit: number; windowMs: number },
    userId?: string
): Promise<NextResponse | null> {
    const limiter = rateLimit(config);
    return limiter(request, userId);
}

/**
 * Get rate limit headers for successful requests
 */
export function getRateLimitHeaders(
    identifier: string,
    config: { limit: number; windowMs: number }
): Record<string, string> {
    const remaining = rateLimiter.getRemaining(identifier, config.limit);
    const resetTime = rateLimiter.getResetTime(identifier);

    return {
        'X-RateLimit-Limit': config.limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': resetTime?.toString() || ''
    };
}

export { rateLimiter };
