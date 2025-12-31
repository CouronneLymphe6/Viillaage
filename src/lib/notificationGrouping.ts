import { prisma } from '@/lib/prisma';
import { sendPushNotification } from '@/lib/pushNotifications';

/**
 * Create or update a grouped notification
 * This prevents spam by grouping similar notifications together
 */
export async function createOrUpdateGroupedNotification({
    userId,
    type,
    groupKey,
    title,
    message,
    link,
}: {
    userId: string;
    type: string;
    groupKey: string;
    title: string;
    message: string;
    link?: string;
}) {
    try {
        // Look for existing notification in the last 24 hours with same groupKey
        const existingNotification = await prisma.notification.findFirst({
            where: {
                userId,
                type,
                groupKey,
                createdAt: {
                    gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
                },
            },
        });

        if (existingNotification) {
            // Update existing notification (refresh it)
            await prisma.notification.update({
                where: { id: existingNotification.id },
                data: {
                    title,
                    message,
                    isRead: false, // Mark as unread again
                    updatedAt: new Date(),
                },
            });

            return existingNotification;
        } else {
            // Create new notification
            const notification = await prisma.notification.create({
                data: {
                    userId,
                    type,
                    groupKey,
                    title,
                    message,
                    link,
                },
            });

            // Send push notification asynchronously (fire-and-forget)
            sendPushNotification(userId, {
                title,
                body: message,
                url: link,
            }).catch(error => {
                console.error('Failed to send push notification:', error);
            });

            return notification;
        }
    } catch (error) {
        console.error('Error creating/updating grouped notification:', error);
        return null;
    }
}
