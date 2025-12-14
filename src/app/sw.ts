import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { Serwist, CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'serwist';

// This declares the value of `injectionPoint` to TypeScript.
// `injectionPoint` is the string that will be replaced by the
// actual precache manifest. By default, this string is set to
// `"self.__SW_MANIFEST"`.
declare global {
    interface WorkerGlobalScope extends SerwistGlobalConfig {
        __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
    }
}

declare const self: WorkerGlobalScope;

// PERFORMANCE: Custom caching strategies per requirements
const serwist = new Serwist({
    precacheEntries: self.__SW_MANIFEST,
    skipWaiting: true,
    clientsClaim: true,
    navigationPreload: true,
    runtimeCaching: [
        // UI (HTML / CSS / JS): cache-first
        {
            matcher: ({ url }) => /\.(js|css|html)$/i.test(url.pathname),
            handler: new CacheFirst({
                cacheName: 'static-resources',
                plugins: [
                    {
                        cacheWillUpdate: async ({ response }) => {
                            return response.status === 200 ? response : null;
                        },
                    },
                ],
            }),
        },
        // Images: stale-while-revalidate
        {
            matcher: ({ url }) => /\.(png|jpg|jpeg|svg|gif|webp|ico)$/i.test(url.pathname),
            handler: new StaleWhileRevalidate({
                cacheName: 'images',
                plugins: [
                    {
                        cacheWillUpdate: async ({ response }) => {
                            return response.status === 200 ? response : null;
                        },
                    },
                ],
            }),
        },
        // Données dynamiques (API): network-first
        {
            matcher: ({ url }) => url.pathname.startsWith('/api/'),
            handler: new NetworkFirst({
                cacheName: 'api-cache',
                networkTimeoutSeconds: 3,
                plugins: [
                    {
                        cacheWillUpdate: async ({ response }) => {
                            // Ne jamais cacher les erreurs ou les données IA
                            if (response.status !== 200) return null;
                            const url = response.url;
                            // IA & calculs dynamiques : jamais en cache
                            if (url.includes('/ai/') || url.includes('/analytics/') || url.includes('/summary')) {
                                return null;
                            }
                            return response;
                        },
                    },
                ],
            }),
        },
    ],
    fallbacks: {
        entries: [
            {
                url: '/offline',
                matcher({ request }) {
                    return request.destination === 'document';
                },
            },
        ],
    },
});


serwist.addEventListeners();

// Cast self to any to avoid TS errors during build
const sw = self as any;

sw.addEventListener('push', (event: any) => {
    const data = event.data?.json() ?? { title: 'Village', body: 'Nouvelle notification' };

    event.waitUntil(
        sw.registration.showNotification(data.title, {
            body: data.body,
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            vibrate: [100, 50, 100],
            data: {
                url: data.url || '/'
            }
        })
    );
});

sw.addEventListener('notificationclick', (event: any) => {
    event.notification.close();
    event.waitUntil(
        sw.clients.openWindow(event.notification.data?.url || '/')
    );
});
