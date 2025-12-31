import { prisma } from '@/lib/prisma';
import { sendPushNotification } from '@/lib/pushNotifications';

interface CreateNotificationParams {
    userId: string;
    type: 'ALERT' | 'BUSINESS' | 'MARKET' | 'MESSAGE' | 'FEED' | 'EVENT' | 'ASSOCIATION' | 'LIKE' | 'COMMENT';
    title: string;
    message: string;
    link?: string;
    groupKey?: string; // For grouping similar notifications
}

/**
 * Map notification type to preference field
 */
function getPreferenceField(type: string): 'enableAlerts' | 'enableBusiness' | 'enableMarket' | 'enableMessages' | 'enableFeed' | 'enableEvents' | 'enableAssociations' {
    switch (type) {
        case 'ALERT': return 'enableAlerts';
        case 'BUSINESS': return 'enableBusiness';
        case 'MARKET': return 'enableMarket';
        case 'MESSAGE': return 'enableMessages';
        case 'FEED': return 'enableFeed';
        case 'EVENT': return 'enableEvents';
        case 'ASSOCIATION': return 'enableAssociations';
        case 'LIKE': return 'enableFeed'; // Likes are part of feed engagement
        case 'COMMENT': return 'enableFeed'; // Comments are part of feed engagement
        default: return 'enableAlerts';
    }
}

/**
 * Create a notification for a specific user (respects user preferences)
 */
export async function createNotification(params: CreateNotificationParams) {
    try {
        // Check user preferences
        const preferences = await prisma.notificationPreference.findUnique({
            where: { userId: params.userId },
        });

        // If preferences exist and this type is disabled, skip notification
        const preferenceField = getPreferenceField(params.type);
        if (preferences && !preferences[preferenceField]) {
            return null; // User has opted out of this notification type
        }

        const notification = await prisma.notification.create({
            data: {
                userId: params.userId,
                type: params.type,
                title: params.title,
                message: params.message,
                link: params.link,
                groupKey: params.groupKey,
            },
        });

        // Send push notification asynchronously (fire-and-forget)
        // This won't block the main process and won't affect performance
        sendPushNotification(params.userId, {
            title: params.title,
            body: params.message,
            url: params.link,
        }).catch(error => {
            // Log error but don't fail the notification creation
            console.error('Failed to send push notification:', error);
        });

        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        return null;
    }
}

/**
 * Create notifications for all users in a village (except the creator)
 * Respects individual user notification preferences
 */
export async function notifyVillageUsers(params: {
    villageId: string;
    excludeUserId?: string;
    type: 'ALERT' | 'BUSINESS' | 'MARKET' | 'MESSAGE' | 'FEED' | 'EVENT' | 'ASSOCIATION';
    title: string;
    message: string;
    link?: string;
}) {
    try {
        const preferenceField = getPreferenceField(params.type);

        // Get all users in the village with their preferences
        const users = await prisma.user.findMany({
            where: {
                villageId: params.villageId,
                id: params.excludeUserId ? { not: params.excludeUserId } : undefined,
            },
            select: {
                id: true,
                notificationPreference: {
                    select: {
                        [preferenceField]: true,
                    },
                },
            },
        });

        // Filter users who have not opted out
        const eligibleUsers = users.filter(user => {
            // If no preferences exist, default is enabled (true)
            if (!user.notificationPreference) return true;
            // Check if this notification type is enabled
            return user.notificationPreference[preferenceField] !== false;
        });

        if (eligibleUsers.length === 0) {
            return { count: 0 };
        }

        // Create notifications only for eligible users
        const notifications = await prisma.notification.createMany({
            data: eligibleUsers.map(user => ({
                userId: user.id,
                type: params.type,
                title: params.title,
                message: params.message,
                link: params.link,
            })),
        });

        return notifications;
    } catch (error) {
        console.error('Error notifying village users:', error);
        return null;
    }
}
