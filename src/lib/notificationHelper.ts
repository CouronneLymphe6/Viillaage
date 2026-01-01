import { prisma } from '@/lib/prisma';
import { sendPushNotification } from '@/lib/pushNotifications';

interface CreateNotificationParams {
    userId: string;
    type: 'ALERT' | 'BUSINESS' | 'MARKET' | 'MESSAGE' | 'FEED' | 'EVENT' | 'ASSOCIATION' | 'LIKE' | 'COMMENT';
    title: string;
    message: string;
    link?: string;
    groupKey?: string; // For grouping similar notifications
    context?: { isReply?: boolean; isCommentLike?: boolean }; // For granular preferences
}

/**
 * Map notification type to preference field
 */
function getPreferenceField(type: string, context?: { isReply?: boolean; isCommentLike?: boolean }):
    'enableAlerts' | 'enableBusiness' | 'enableMarket' | 'enableMessages' | 'enableFeed' | 'enableEvents' | 'enableAssociations' | 'enableLikes' | 'enableComments' | 'enableReplies' | 'enableCommentLikes' {
    switch (type) {
        case 'ALERT': return 'enableAlerts';
        case 'BUSINESS': return 'enableBusiness';
        case 'MARKET': return 'enableMarket';
        case 'MESSAGE': return 'enableMessages';
        case 'FEED': return 'enableFeed';
        case 'EVENT': return 'enableEvents';
        case 'ASSOCIATION': return 'enableAssociations';
        case 'LIKE':
            // If it's a like on a comment, use enableCommentLikes
            return context?.isCommentLike ? 'enableCommentLikes' : 'enableLikes';
        case 'COMMENT':
            // If it's a reply to a comment, use enableReplies
            return context?.isReply ? 'enableReplies' : 'enableComments';
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
        const preferenceField = getPreferenceField(params.type, params.context);
        if (preferences && !(preferences as any)[preferenceField]) {
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
        // We select ALL preferences to be resilient against schema drift
        // (If we select dynamic field that Prisma doesn't know about yet, it crashes)
        const users = await prisma.user.findMany({
            where: {
                villageId: params.villageId,
                id: params.excludeUserId ? { not: params.excludeUserId } : undefined,
            },
            select: {
                id: true,
                notificationPreference: true, // Fetch all fields
            },
        });

        // Filter users who have not opted out
        const eligibleUsers = users.filter(user => {
            // If no preferences exist, default is enabled (true)
            if (!user.notificationPreference) return true;

            // Type-safe access with fallback to true
            // We use 'as any' here because if the type is really missing in Prisma Client, 
            // TS won't know about it, but at runtime it might be there (or undefined)
            const prefs = user.notificationPreference as any;

            // Check if this notification type is enabled
            // If the field is missing (undefined), we default to true (opt-out behavior)
            return prefs[preferenceField] !== false;
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

        // Send push notifications to eligible users who have enabled push
        const pushUserIds = eligibleUsers
            .filter(user => {
                const prefs = user.notificationPreference as any;
                return !prefs || prefs.enablePush !== false;
            })
            .map(user => user.id);

        if (pushUserIds.length > 0) {
            const { sendPushNotificationToMultipleUsers } = await import('@/lib/pushNotifications');

            // Fire and forget push notifications
            sendPushNotificationToMultipleUsers(pushUserIds, {
                title: params.title,
                body: params.message,
                url: params.link,
            }).catch(console.error);
        }

        return notifications;
    } catch (error) {
        console.error('Error notifying village users:', error);
        return null;
    }
}
