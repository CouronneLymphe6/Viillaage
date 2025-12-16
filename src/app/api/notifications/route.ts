import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/notifications - Get user notifications
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const notifications = await prisma.notification.findMany({
            where: {
                userId: session.user.id,
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 50, // Limit to 50 most recent
        });

        // Cache for 30 seconds to reduce DB load
        return NextResponse.json(notifications, {
            headers: {
                'Cache-Control': 'private, s-maxage=30, stale-while-revalidate=60',
            },
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

// PATCH /api/notifications - Mark notification(s) as read AND DELETE them
// Per user request: notifications are deleted after being read
export async function PATCH(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await request.json();
        const { notificationId, markAllAsRead } = body;

        if (markAllAsRead) {
            // Delete all user notifications (they've been "read" by viewing the list)
            const result = await prisma.notification.deleteMany({
                where: {
                    userId: session.user.id,
                },
            });

            return NextResponse.json({
                success: true,
                message: 'All notifications cleared',
                deletedCount: result.count
            });
        } else if (notificationId) {
            // Delete specific notification after clicking on it
            await prisma.notification.delete({
                where: {
                    id: notificationId,
                    userId: session.user.id, // Ensure user owns the notification
                },
            });

            return NextResponse.json({ success: true, deleted: notificationId });
        } else {
            return new NextResponse("Missing notificationId or markAllAsRead", { status: 400 });
        }
    } catch (error) {
        console.error('Error updating notification:', error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

// DELETE /api/notifications - Delete a notification
export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const notificationId = searchParams.get('id');

        if (!notificationId) {
            return new NextResponse("Missing notification ID", { status: 400 });
        }

        // Delete notification only if user owns it
        await prisma.notification.delete({
            where: {
                id: notificationId,
                userId: session.user.id,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting notification:', error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
