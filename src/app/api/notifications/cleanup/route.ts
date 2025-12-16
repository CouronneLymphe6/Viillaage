import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// DELETE /api/notifications/cleanup - Auto-delete read notifications
// This endpoint deletes all READ notifications immediately after they are marked as read
// Called automatically when a notification is marked as read
export async function DELETE() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Delete all read notifications for this user
        const result = await prisma.notification.deleteMany({
            where: {
                userId: session.user.id,
                isRead: true,
            },
        });

        return NextResponse.json({
            success: true,
            deletedCount: result.count
        });
    } catch (error) {
        console.error('Error cleaning up notifications:', error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
