import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const response = NextResponse.next();

    // Add caching headers for API routes (GET only)
    if (request.nextUrl.pathname.startsWith('/api/') && request.method === 'GET') {
        // Determine cache duration based on endpoint
        let cacheControl = 'no-cache';

        // Static/slow-changing data - aggressive cache
        if (
            request.nextUrl.pathname.includes('/businesses') ||
            request.nextUrl.pathname.includes('/associations') ||
            request.nextUrl.pathname.includes('/events') ||
            request.nextUrl.pathname.includes('/listings') ||
            request.nextUrl.pathname.includes('/weather') ||
            request.nextUrl.pathname.includes('/villages')
        ) {
            cacheControl = 'public, s-maxage=60, stale-while-revalidate=120';
        }

        // Frequently changing data - moderate cache
        else if (
            request.nextUrl.pathname.includes('/alerts') ||
            request.nextUrl.pathname.includes('/messages') ||
            request.nextUrl.pathname.includes('/channels')
        ) {
            cacheControl = 'public, s-maxage=30, stale-while-revalidate=60';
        }

        // Real-time data - minimal cache  
        else if (
            request.nextUrl.pathname.includes('/notifications')
        ) {
            cacheControl = 'private, s-maxage=10, stale-while-revalidate=30';
        }

        response.headers.set('Cache-Control', cacheControl);
    }

    return response;
}

export const config = {
    matcher: '/api/:path*',
};
