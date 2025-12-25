import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendPushNotification, sendPushNotificationToMultipleUsers } from '@/lib/pushNotifications';

/**
 * API endpoint to send push notifications
 * POST /api/push/send
 * 
 * Body:
 * - userId (string) OR userIds (string[]) - Target user(s)
 * - title (string) - Notification title
 * - body (string) - Notification body
 * - url (string, optional) - URL to navigate to when clicked
 * 
 * This endpoint is protected and requires admin authentication
 */
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        // Only admins can send push notifications via this endpoint
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { userId, userIds, title, body: message, url } = body;

        // Validate input
        if (!title || !message) {
            return NextResponse.json(
                { error: 'Missing required fields: title and body' },
                { status: 400 }
            );
        }

        if (!userId && !userIds) {
            return NextResponse.json(
                { error: 'Either userId or userIds must be provided' },
                { status: 400 }
            );
        }

        let result;

        // Send to single user
        if (userId) {
            result = await sendPushNotification(userId, {
                title,
                body: message,
                url,
            });
        }
        // Send to multiple users
        else if (userIds && Array.isArray(userIds)) {
            result = await sendPushNotificationToMultipleUsers(userIds, {
                title,
                body: message,
                url,
            });
        }

        return NextResponse.json({
            success: true,
            ...result,
        });
    } catch (error) {
        console.error('Error in push send API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
