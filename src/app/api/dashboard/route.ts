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

        // Fetch data in parallel - FAST!
        const [alerts, events, listings, proData] = await Promise.all([
            prisma.alert.findMany({
                where: { user: { villageId: userVillageId } },
                take: 10,
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
            prisma.event.findMany({
                where: {
                    date: { gte: new Date() },
                    organizer: { villageId: userVillageId },
                },
                take: 3,
                orderBy: { date: 'asc' },
                select: {
                    id: true,
                    title: true,
                    description: true,
                    date: true,
                    organizer: { select: { name: true } }
                },
            }),
            prisma.listing.findMany({
                where: { user: { villageId: userVillageId } },
                take: 3,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    title: true,
                    description: true,
                    price: true,
                    category: true,
                    createdAt: true,
                    user: { select: { name: true } }
                },
            }),
            Promise.all([
                prisma.proAgenda.findMany({
                    where: {
                        startDate: { gte: new Date() },
                        business: { owner: { villageId: userVillageId } },
                    },
                    take: 5,
                    orderBy: { startDate: 'asc' },
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        startDate: true,
                        endDate: true,
                        business: { select: { name: true } }
                    },
                }),
                prisma.proPost.findMany({
                    where: { business: { owner: { villageId: userVillageId } } },
                    take: 3,
                    orderBy: { createdAt: 'desc' },
                    select: {
                        id: true,
                        content: true,
                        mediaUrl: true,
                        mediaType: true,
                        createdAt: true,
                        business: { select: { name: true, id: true } },
                        _count: { select: { likes: true, comments: true } }
                    },
                }),
            ]),
        ]);

        const [proAgendaEvents, proPosts] = proData;

        // Separate alerts
        const securityAlerts = alerts.filter((a: any) => !a.type.startsWith('OFFICIAL_')).slice(0, 3);
        const officialAnnouncements = alerts.filter((a: any) => a.type.startsWith('OFFICIAL_')).slice(0, 3);

        return NextResponse.json({
            securityAlerts,
            officialAnnouncements,
            events,
            proAgendaEvents,
            proPosts,
            listings,
        }, {
            headers: {
                'Cache-Control': 'private, s-maxage=30, stale-while-revalidate=60',
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
