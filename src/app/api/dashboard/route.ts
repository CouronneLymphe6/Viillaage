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

        // CRITICAL PWA OPTIMIZATION: Load ONLY essential data on first load
        // Other data will be lazy-loaded on user interaction
        const [alerts] = await Promise.all([
            // Only critical security alerts (reduced from 10 to 5)
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
        ]);

        // Separate alerts for dashboard
        const securityAlerts = alerts.filter((a: any) => !a.type.startsWith('OFFICIAL_')).slice(0, 3);
        const officialAnnouncements = alerts.filter((a: any) => a.type.startsWith('OFFICIAL_')).slice(0, 2);

        // Return only critical data - rest will be lazy loaded by components
        return NextResponse.json({
            securityAlerts,
            officialAnnouncements,
            // Empty arrays for lazy-loaded data
            events: [],
            proAgendaEvents: [],
            proPosts: [],
            listings: [],
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
