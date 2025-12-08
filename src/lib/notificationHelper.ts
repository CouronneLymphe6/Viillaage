import { prisma } from '@/lib/prisma';

interface CreateNotificationParams {
    userId: string;
    type: 'ALERT' | 'BUSINESS' | 'MARKET' | 'MESSAGE';
    title: string;
    message: string;
    link?: string;
}

/**
 * Create a notification for a specific user
 */
export async function createNotification(params: CreateNotificationParams) {
    try {
        const notification = await prisma.notification.create({
            data: {
                userId: params.userId,
                type: params.type,
                title: params.title,
                message: params.message,
                link: params.link,
            },
        });
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        return null;
    }
}

/**
 * Create notifications for all users in a village (except the creator)
 */
export async function notifyVillageUsers(params: {
    villageId: string;
    excludeUserId?: string;
    type: 'ALERT' | 'BUSINESS' | 'MARKET' | 'MESSAGE';
    title: string;
    message: string;
    link?: string;
}) {
    try {
        // Get all users in the village
        const users = await prisma.user.findMany({
            where: {
                villageId: params.villageId,
                id: params.excludeUserId ? { not: params.excludeUserId } : undefined,
            },
            select: { id: true },
        });

        // Create notifications for each user
        const notifications = await prisma.notification.createMany({
            data: users.map(user => ({
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
