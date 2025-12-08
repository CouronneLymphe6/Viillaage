import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/isAdmin';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        await requireAdmin();

        const now = new Date();
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 7);

        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(now.getDate() - 30);

        // Get all stats in parallel
        const [
            totalUsers,
            newUsersLast7Days,
            newUsersLast30Days,
            totalVillages,
            totalBusinesses,
            totalAssociations,
            totalEvents,
            eventsLast7Days,
            totalAlerts,
            totalMessages,
            unreadContactMessages,
            totalChannels,
            totalChatMessages
        ] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
            prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
            prisma.village.count(),
            prisma.business.count(),
            prisma.association.count(),
            prisma.event.count(),
            prisma.event.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
            prisma.alert.count(),
            prisma.message.count(),
            prisma.contactMessage.count({ where: { status: 'NEW' } }),
            prisma.channel.count(),
            prisma.message.count()
        ]);

        // Calculate growth percentages
        const userGrowth7d = totalUsers > 0
            ? ((newUsersLast7Days / totalUsers) * 100).toFixed(1)
            : '0';

        const userGrowth30d = totalUsers > 0
            ? ((newUsersLast30Days / totalUsers) * 100).toFixed(1)
            : '0';

        return NextResponse.json({
            users: {
                total: totalUsers,
                newLast7Days: newUsersLast7Days,
                newLast30Days: newUsersLast30Days,
                growth7d: `+${userGrowth7d}%`,
                growth30d: `+${userGrowth30d}%`
            },
            villages: {
                total: totalVillages
            },
            businesses: {
                total: totalBusinesses
            },
            associations: {
                total: totalAssociations
            },
            events: {
                total: totalEvents,
                newLast7Days: eventsLast7Days
            },
            alerts: {
                total: totalAlerts
            },
            messaging: {
                totalChannels,
                totalMessages: totalChatMessages
            },
            contact: {
                total: totalMessages,
                unread: unreadContactMessages
            },
            summary: {
                totalContent: totalBusinesses + totalAssociations + totalEvents + totalAlerts,
                activeUsers: totalUsers, // Could be refined with activity tracking
                engagement: totalChatMessages + totalAlerts + totalEvents
            }
        });

    } catch (error: any) {
        if (error.message === 'Unauthorized: Admin access required') {
            return NextResponse.json(
                { error: 'Accès non autorisé' },
                { status: 403 }
            );
        }
        console.error('Error fetching admin stats:', error);
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}
