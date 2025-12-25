import webpush from 'web-push';
import { prisma } from '@/lib/prisma';

// Configuration VAPID
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:contact@viillaage.fr';

// Initialize web-push only if keys are available
if (vapidPublicKey && vapidPrivateKey) {
    webpush.setVapidDetails(
        vapidSubject,
        vapidPublicKey,
        vapidPrivateKey
    );
}

export interface PushNotificationPayload {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    url?: string;
    data?: Record<string, any>;
}

/**
 * Send a push notification to a specific user
 * @param userId - The user ID to send the notification to
 * @param payload - The notification payload
 * @returns Promise with the result
 */
export async function sendPushNotification(
    userId: string,
    payload: PushNotificationPayload
): Promise<{ success: boolean; sent: number; failed: number }> {
    // Check if VAPID keys are configured
    if (!vapidPublicKey || !vapidPrivateKey) {
        console.warn('⚠️ VAPID keys not configured. Push notifications disabled.');
        return { success: false, sent: 0, failed: 0 };
    }

    try {
        // Get user's push subscriptions
        const subscriptions = await prisma.pushSubscription.findMany({
            where: { userId },
        });

        if (subscriptions.length === 0) {
            return { success: true, sent: 0, failed: 0 };
        }

        // Check if user has enabled push notifications
        const preferences = await prisma.notificationPreference.findUnique({
            where: { userId },
            select: { enablePush: true },
        });

        // If user has disabled push notifications, skip
        if (preferences && !preferences.enablePush) {
            return { success: true, sent: 0, failed: 0 };
        }

        // Prepare notification payload
        const notificationPayload = JSON.stringify({
            title: payload.title,
            body: payload.body,
            icon: payload.icon || '/icon-192.png',
            badge: payload.badge || '/icon-192.png',
            url: payload.url || '/',
            data: payload.data || {},
        });

        let sent = 0;
        let failed = 0;

        // Send to all user's subscriptions
        const sendPromises = subscriptions.map(async (subscription) => {
            try {
                const pushSubscription = {
                    endpoint: subscription.endpoint,
                    keys: {
                        auth: subscription.auth,
                        p256dh: subscription.p256dh,
                    },
                };

                await webpush.sendNotification(pushSubscription, notificationPayload);
                sent++;
            } catch (error: any) {
                console.error(`Failed to send push notification to subscription ${subscription.id}:`, error);
                
                // If subscription is invalid (410 Gone or 404 Not Found), delete it
                if (error.statusCode === 410 || error.statusCode === 404) {
                    await prisma.pushSubscription.delete({
                        where: { id: subscription.id },
                    }).catch(err => console.error('Error deleting invalid subscription:', err));
                }
                
                failed++;
            }
        });

        await Promise.all(sendPromises);

        return { success: true, sent, failed };
    } catch (error) {
        console.error('Error sending push notification:', error);
        return { success: false, sent: 0, failed: 0 };
    }
}

/**
 * Send push notifications to multiple users
 * @param userIds - Array of user IDs
 * @param payload - The notification payload
 * @returns Promise with the result
 */
export async function sendPushNotificationToMultipleUsers(
    userIds: string[],
    payload: PushNotificationPayload
): Promise<{ success: boolean; totalSent: number; totalFailed: number }> {
    let totalSent = 0;
    let totalFailed = 0;

    const sendPromises = userIds.map(async (userId) => {
        const result = await sendPushNotification(userId, payload);
        totalSent += result.sent;
        totalFailed += result.failed;
    });

    await Promise.all(sendPromises);

    return { success: true, totalSent, totalFailed };
}

/**
 * Check if push notifications are configured
 */
export function isPushNotificationsConfigured(): boolean {
    return !!(vapidPublicKey && vapidPrivateKey);
}
