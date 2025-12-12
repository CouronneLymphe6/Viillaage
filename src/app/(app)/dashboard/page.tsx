import { Suspense } from 'react';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardGrid from "@/components/DashboardGrid";
import DashboardSkeleton from "@/components/DashboardSkeleton";

// Force dynamic rendering but with caching
export const dynamic = 'force-dynamic';
export const revalidate = 30; // Cache for 30 seconds

export default async function Dashboard() {
    const session = await getServerSession(authOptions);

    // Get user's village
    const userVillageId = (session?.user as any)?.villageId;

    // If no village, show empty dashboard
    if (!userVillageId) {
        return (
            <div style={{ textAlign: 'center', padding: '40px' }}>
                <h2>Bienvenue sur Viillaage !</h2>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Veuillez sélectionner votre village pour accéder au contenu.
                </p>
            </div>
        );
    }

    // OPTIMIZED: Single parallel fetch with minimal data
    // Instead of 5 separate queries, we fetch in parallel AND limit data
    const [alerts, events, listings, proData] = await Promise.all([
        // Alerts - get all types in one query
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
        // Events
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
                type: true,
                organizer: { select: { name: true } }
            },
        }),
        // Listings
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
        // Pro data combined
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
                    type: true,
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

    // Separate security alerts from official announcements
    const securityAlerts = alerts.filter((a: any) => !a.type.startsWith('OFFICIAL_')).slice(0, 3);
    const officialAnnouncements = alerts.filter((a: any) => a.type.startsWith('OFFICIAL_')).slice(0, 3);

    return (
        <DashboardGrid
            userName={session?.user?.name || 'Habitant'}
            securityAlerts={securityAlerts}
            officialAnnouncements={officialAnnouncements}
            events={events}
            proAgendaEvents={proAgendaEvents}
            listings={listings}
            proPosts={proPosts}
        />
    );
}
