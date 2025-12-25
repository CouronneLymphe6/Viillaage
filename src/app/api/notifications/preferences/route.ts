import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/notifications/preferences - Get user's notification preferences
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Find or create default preferences
        let preferences = await prisma.notificationPreference.findUnique({
            where: { userId: session.user.id },
        });

        if (!preferences) {
            // Create default preferences
            preferences = await prisma.notificationPreference.create({
                data: {
                    userId: session.user.id,
                    enableAlerts: true,
                    enableMarket: true,
                    enableBusiness: true,
                    enableMessages: true,
                    enablePush: true,
                },
            });
        }

        return NextResponse.json(preferences);
    } catch (error) {
        console.error('Error fetching notification preferences:', error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

// PATCH /api/notifications/preferences - Update user's notification preferences
export async function PATCH(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await request.json();
        const { enableAlerts, enableMarket, enableBusiness, enableMessages, enablePush } = body;

        // Upsert preferences (create if not exists, update if exists)
        const preferences = await prisma.notificationPreference.upsert({
            where: { userId: session.user.id },
            update: {
                ...(enableAlerts !== undefined && { enableAlerts }),
                ...(enableMarket !== undefined && { enableMarket }),
                ...(enableBusiness !== undefined && { enableBusiness }),
                ...(enableMessages !== undefined && { enableMessages }),
                ...(enablePush !== undefined && { enablePush }),
            },
            create: {
                userId: session.user.id,
                enableAlerts: enableAlerts ?? true,
                enableMarket: enableMarket ?? true,
                enableBusiness: enableBusiness ?? true,
                enableMessages: enableMessages ?? true,
                enablePush: enablePush ?? true,
            },
        });

        return NextResponse.json(preferences);
    } catch (error) {
        console.error('Error updating notification preferences:', error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
