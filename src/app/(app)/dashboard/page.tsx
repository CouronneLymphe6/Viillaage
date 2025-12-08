import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

// Translation function for official announcement types
const getOfficialTypeLabel = (type: string): string => {
    const typeMap: Record<string, string> = {
        'OFFICIAL_DECREE': 'Arrêté municipal',
        'OFFICIAL_INFO': 'Information',
        'OFFICIAL_WARNING': 'Avertissement',
        'OFFICIAL_EVENT': 'Événement officiel',
        'OFFICIAL_WORK': 'Travaux',
    };
    return typeMap[type] || type.replace('OFFICIAL_', '').replace('_', ' ');
};

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
        <div>
            <header style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: 'var(--spacing-xs)' }}>
                    Bonjour, {session?.user?.name || 'Habitant'} !
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Voici ce qui se passe dans votre village aujourd'hui.
                </p>
            </header>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: 'var(--spacing-md)',
            }}>
                {/* Widget 1: Security Alerts */}
                <div style={{
                    backgroundColor: 'var(--secondary)',
                    padding: 'var(--spacing-md)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-sm)',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-sm)' }}>
                        <h3 style={{ color: 'var(--primary)' }}>🚨 Alertes Récentes</h3>
                        <Link href="/alerts" style={{ fontSize: '0.9rem', color: 'var(--primary)' }}>Voir tout</Link>
                    </div>
                    {securityAlerts.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)' }}>Aucune alerte signalée.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                            {securityAlerts.map((alert: any) => (
                                <div key={alert.id} style={{ fontSize: '0.9rem' }}>
                                    <div style={{ fontWeight: '600' }}>{alert.type}</div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                                        {alert.description.substring(0, 50)}...
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Widget 2: Events (including Pro Agenda) */}
                <div style={{
                    backgroundColor: 'var(--secondary)',
                    padding: 'var(--spacing-md)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-sm)',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-sm)' }}>
                        <h3 style={{ color: 'var(--primary)' }}>📅 Prochains Événements</h3>
                        <Link href="/events" style={{ fontSize: '0.9rem', color: 'var(--primary)' }}>Voir tout</Link>
                    </div>
                    {events.length === 0 && proAgendaEvents.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)' }}>Aucun événement prévu.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                            {events.map((event: any) => (
                                <div key={`event-${event.id}`} style={{ fontSize: '0.9rem' }}>
                                    <div style={{ fontWeight: '600' }}>{event.title}</div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                                        {new Date(event.date).toLocaleDateString('fr-FR')}
                                    </div>
                                </div>
                            ))}
                            {proAgendaEvents.map((agendaEvent: any) => (
                                <div key={`agenda-${agendaEvent.id}`} style={{ fontSize: '0.9rem' }}>
                                    <div style={{ fontWeight: '600' }}>
                                        {agendaEvent.type === 'EVENT' ? '🎉' : agendaEvent.type === 'CLOSURE' ? '🔒' : '📅'} {agendaEvent.title}
                                    </div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                                        {agendaEvent.business.name} • {new Date(agendaEvent.startDate).toLocaleDateString('fr-FR')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Widget 3: Le Marché */}
                <div style={{
                    backgroundColor: 'var(--secondary)',
                    padding: 'var(--spacing-md)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-sm)',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-sm)' }}>
                        <h3 style={{ color: 'var(--primary)' }}>🛍️ Dernières Annonces</h3>
                        <Link href="/market" style={{ fontSize: '0.9rem', color: 'var(--primary)' }}>Voir tout</Link>
                    </div>
                    {listings.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)' }}>Aucune annonce.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                            {listings.map((listing: any) => (
                                <div key={listing.id} style={{ fontSize: '0.9rem' }}>
                                    <div style={{ fontWeight: '600' }}>{listing.title}</div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                                        {listing.price ? `${listing.price}€` : listing.category}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Widget 4: Official Panel */}
                <div style={{
                    backgroundColor: 'var(--secondary)',
                    padding: 'var(--spacing-md)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-sm)',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-sm)' }}>
                        <h3 style={{ color: 'var(--primary)' }}>📢 Panneau Officiel</h3>
                        <Link href="/official" style={{ fontSize: '0.9rem', color: 'var(--primary)' }}>Voir tout</Link>
                    </div>
                    {officialAnnouncements.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)' }}>Aucune annonce officielle.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                            {officialAnnouncements.map((announcement: any) => (
                                <div key={announcement.id} style={{ fontSize: '0.9rem' }}>
                                    <div style={{ fontWeight: '600' }}>{getOfficialTypeLabel(announcement.type)}</div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                                        {announcement.description.substring(0, 50)}...
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Widget 5: Pro News - NEW */}
                <div style={{
                    backgroundColor: 'var(--secondary)',
                    padding: 'var(--spacing-md)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-sm)',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-sm)' }}>
                        <h3 style={{ color: 'var(--primary)' }}>🏪 Actualités des Pros</h3>
                        <Link href="/village" style={{ fontSize: '0.9rem', color: 'var(--primary)' }}>Voir tout</Link>
                    </div>
                    {proPosts.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)' }}>Aucune actualité.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                            {proPosts.map((post: any) => (
                                <Link
                                    key={post.id}
                                    href={`/village/pro/${post.business.id}`}
                                    style={{
                                        fontSize: '0.9rem',
                                        textDecoration: 'none',
                                        color: 'inherit',
                                    }}
                                >
                                    <div style={{
                                        padding: '8px',
                                        borderRadius: 'var(--radius-sm)',
                                        cursor: 'pointer',
                                    }}>
                                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>{post.business.name}</div>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '4px' }}>
                                            {post.content.substring(0, 60)}{post.content.length > 60 ? '...' : ''}
                                        </div>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', display: 'flex', gap: '12px' }}>
                                            <span>👍 {post._count.likes}</span>
                                            <span>💬 {post._count.comments}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
