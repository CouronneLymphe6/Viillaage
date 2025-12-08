import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * CSRF Protection using Double Submit Cookie pattern
 */

const CSRF_TOKEN_HEADER = 'x-csrf-token';
const CSRF_COOKIE_NAME = 'csrf-token';

/**
 * Generate a random CSRF token
 */
export function generateCsrfToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify CSRF token from request
 */
export function verifyCsrfToken(request: NextRequest): boolean {
    // Skip CSRF check for GET, HEAD, OPTIONS
    const method = request.method;
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
        return true;
    }

    const tokenFromHeader = request.headers.get(CSRF_TOKEN_HEADER);
    const tokenFromCookie = request.cookies.get(CSRF_COOKIE_NAME)?.value;

    if (!tokenFromHeader || !tokenFromCookie) {
        return false;
    }

    // Constant-time comparison to prevent timing attacks
    return tokenFromHeader === tokenFromCookie;
}

/**
 * Middleware to check CSRF token
 */
export async function csrfProtection(
    request: NextRequest
): Promise<NextResponse | null> {
    const isValid = verifyCsrfToken(request);

    if (!isValid) {
        return NextResponse.json(
            { error: 'Invalid CSRF token' },
            { status: 403 }
        );
    }

    return null; // CSRF check passed
}

/**
 * Check origin header to prevent CSRF
 */
export function verifyOrigin(request: NextRequest): boolean {
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');

    // If no origin header, check referer
    if (!origin) {
        const referer = request.headers.get('referer');
        if (!referer) {
            // No origin or referer - could be a direct request or API client
            // Allow for now, but log for monitoring
            console.warn('Request without origin or referer header');
            return true;
        }

        try {
            const refererUrl = new URL(referer);
            return refererUrl.host === host;
        } catch {
            return false;
        }
    }

    try {
        const originUrl = new URL(origin);
        return originUrl.host === host;
    } catch {
        return false;
    }
}

/**
 * Combined CSRF and origin check
 */
export async function checkCsrfAndOrigin(
    request: NextRequest
): Promise<NextResponse | null> {
    // Check origin first
    if (!verifyOrigin(request)) {
        return NextResponse.json(
            { error: 'Invalid origin' },
            { status: 403 }
        );
    }

    // Then check CSRF token
    return csrfProtection(request);
}

/**
 * Set CSRF token cookie in response
 */
export function setCsrfTokenCookie(response: NextResponse, token: string): void {
    response.cookies.set(CSRF_COOKIE_NAME, token, {
        httpOnly: false, // Must be accessible to JavaScript
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 // 24 hours
    });
}

/**
 * Get or create CSRF token for session
 */
export async function getCsrfToken(request: NextRequest): Promise<string> {
    const existingToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;

    if (existingToken) {
        return existingToken;
    }

    return generateCsrfToken();
}
