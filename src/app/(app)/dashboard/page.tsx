import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardGrid from "@/components/DashboardGrid";

// Enable ISR with 60 seconds revalidation for better performance
export const revalidate = 60;

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

    // Fetch recent data - filtered by village
    const [allAlerts, events, listings, proAgendaEvents, proPosts] = await Promise.all([
        prisma.alert.findMany({
            where: {
                user: {
                    villageId: userVillageId,
                },
            },
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { name: true } } },
        }),
        prisma.event.findMany({
            where: {
                date: { gte: new Date() },
                organizer: {
                    villageId: userVillageId,
                },
            },
            take: 3,
            orderBy: { date: 'asc' },
            include: { organizer: { select: { name: true } } },
        }),
        prisma.listing.findMany({
            where: {
                user: {
                    villageId: userVillageId,
                },
            },
            take: 3,
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { name: true } } },
        }),
        // Pro Agenda Events
        prisma.proAgenda.findMany({
            where: {
                startDate: { gte: new Date() },
                business: {
                    owner: {
                        villageId: userVillageId,
                    },
                },
            },
            take: 5,
            orderBy: { startDate: 'asc' },
            include: {
                business: {
                    select: { name: true }
                }
            },
        }),
        // Pro Posts
        prisma.proPost.findMany({
            where: {
                business: {
                    owner: {
                        villageId: userVillageId,
                    },
                },
            },
            take: 3,
            orderBy: { createdAt: 'desc' },
            include: {
                business: {
                    select: { name: true, id: true }
                },
                _count: {
                    select: { likes: true, comments: true }
                }
            },
        }),
    ]);

    // Separate security alerts from official announcements
    const securityAlerts = allAlerts.filter((a: any) => !a.type.startsWith('OFFICIAL_')).slice(0, 3);
    const officialAnnouncements = allAlerts.filter((a: any) => a.type.startsWith('OFFICIAL_')).slice(0, 3);

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
