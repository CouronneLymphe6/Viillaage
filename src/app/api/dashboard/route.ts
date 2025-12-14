import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
        }

        const userVillageId = (session.user as any)?.villageId;

        if (!userVillageId) {
            return NextResponse.json({ error: 'Village non défini' }, { status: 400 });
        }

        // Fetch dashboard data in parallel
        const [alerts, events, proPosts, listings, associationPosts] = await Promise.all([
            // Security alerts
            prisma.alert.findMany({
                where: {
                    user: { villageId: userVillageId },
                    status: 'ACTIVE'
                },
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    type: true,
                    description: true,
                    status: true,
                    createdAt: true,
                    user: { select: { name: true } }
                },
            }),

            // Events (last 3)
            prisma.event.findMany({
                where: { organizer: { villageId: userVillageId } },
                take: 3,
                orderBy: { date: 'desc' },
                select: { id: true, title: true, date: true }
            }),


            // Pro Posts (last 3)
            prisma.proPost.findMany({
                where: { business: { owner: { villageId: userVillageId } } },
                take: 3,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    content: true,
                    business: { select: { id: true, name: true } },
                    _count: { select: { likes: true, comments: true } }
                }
            }),

            // Listings (last 3)
            prisma.listing.findMany({
                where: { user: { villageId: userVillageId } },
                take: 3,
                orderBy: { createdAt: 'desc' },
                select: { id: true, title: true, price: true, category: true }
            }),

            // Association Posts (last 3)
            prisma.associationPost.findMany({
                where: { association: { owner: { villageId: userVillageId } } },
                take: 3,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    content: true,
                    association: { select: { id: true, name: true } },
                    _count: { select: { likes: true, comments: true } }
                }
            }),
        ]);

        // Separate alerts for dashboard
        const securityAlerts = alerts.filter((a: any) => !a.type.startsWith('OFFICIAL_')).slice(0, 3);
        const officialAnnouncements = alerts.filter((a: any) => a.type.startsWith('OFFICIAL_')).slice(0, 2);

        // Return dashboard data
        return NextResponse.json({
            securityAlerts,
            officialAnnouncements,
            events,
            proAgendaEvents: [], // Empty - model doesn't exist in schema
            proPosts,
            listings,
            associationPosts,
        }, {
            headers: {
                // Aggressive caching for PWA performance
                'Cache-Control': 'private, max-age=15, stale-while-revalidate=30',
            },
        });

    } catch (error) {
        console.error('❌ ERROR /api/dashboard:', error);
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}
