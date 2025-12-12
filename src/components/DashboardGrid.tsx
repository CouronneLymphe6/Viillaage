'use client';

import Link from 'next/link';
import DailySummaryCard from '@/components/DailySummaryCard';
import WeatherCard from '@/components/WeatherCard';

interface DashboardGridProps {
    userName: string;
    securityAlerts: any[];
    officialAnnouncements: any[];
    events: any[];
    proAgendaEvents: any[];
    listings: any[];
    proPosts: any[];
}

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

const getAlertTypeLabel = (type: string): string => {
    const typeMap: Record<string, string> = {
        'ROAD_HAZARD': 'Circulation / Voirie',
        'SUSPICIOUS': 'Activité suspecte',
        'DANGER': 'Danger immédiat',
        'ANIMAL': 'Animaux perdus/errants',
        'WEATHER': 'Météo / Intempéries',
        'OTHER': 'Autre signalement'
    };
    return typeMap[type] || type;
};

export default function DashboardGrid({
    userName,
    securityAlerts,
    officialAnnouncements,
    events,
    proAgendaEvents,
    listings,
    proPosts
}: DashboardGridProps) {
    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '60px' }}>
            <style jsx global>{`
                .dashboard-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 24px;
                }
                @media (min-width: 768px) {
                    .dashboard-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    .span-2-md { grid-column: span 2; }
                }
                @media (min-width: 1200px) {
                    .dashboard-grid {
                        grid-template-columns: repeat(4, 1fr);
                        grid-template-rows: min-content auto; 
                    }
                    .col-span-1 { grid-column: span 1; }
                    .col-span-2 { grid-column: span 2; }
                    .col-span-3 { grid-column: span 3; }
                }
                
                .card {
                    background-color: var(--secondary);
                    border-radius: var(--radius-lg);
                    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
                    height: 100%;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    border: 1px solid rgba(0,0,0,0.05);
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }
                .card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
                }
                .card-header {
                    padding: 20px 24px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid rgba(0,0,0,0.03);
                    background-color: rgba(255,255,255,0.5);
                }
                .card-header h3 {
                    margin: 0;
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: var(--text-main);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .card-content {
                    padding: 20px 24px;
                    flex: 1;
                }
                .card-link {
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: var(--primary);
                    text-decoration: none;
                    padding: 6px 12px;
                    border-radius: 6px;
                    background-color: rgba(var(--primary-rgb), 0.08);
                    transition: background-color 0.2s;
                }
                .card-link:hover {
                    background-color: rgba(var(--primary-rgb), 0.15);
                }
                .empty-state {
                    color: var(--text-secondary);
                    font-style: italic;
                    text-align: center;
                    padding: 24px 0;
                    font-size: 0.95rem;
                }
                .item-row {
                    padding: 12px 0;
                    border-bottom: 1px solid rgba(0,0,0,0.05);
                }
                .item-row:last-child {
                    border-bottom: none;
                }
                .badge-alert {
                    padding: 14px;
                    background-color: #FEF2F2;
                    border-radius: 8px;
                    border-left: 4px solid #EF4444;
                    margin-bottom: 12px;
                }
                .badge-official {
                    padding: 14px;
                    background-color: #F0F9FF;
                    border-radius: 8px;
                    border-left: 4px solid #0EA5E9;
                    margin-bottom: 12px;
                }
                .accent-purple { border-top: 4px solid #8B5CF6; }
                .accent-emerald { border-top: 4px solid #10B981; }
                .accent-amber { border-top: 4px solid #F59E0B; }
            `}</style>

            <header style={{ marginBottom: '32px', paddingTop: '10px' }}>
                <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)' }}>
                    Bonjour, {userName} !
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                    Voici l'essentiel de votre village aujourd'hui.
                </p>
            </header>

            <div className="dashboard-grid">

                {/* 1. SECTION HERO */}
                <div className="col-span-3 span-2-md">
                    <DailySummaryCard />
                </div>

                <div className="col-span-1">
                    <WeatherCard />
                </div>

                {/* 2. SECTION URGENT */}
                <div className="card col-span-2 span-2-md">
                    <div className="card-header">
                        <h3>🚨 Alertes & Sécurité</h3>
                        <Link href="/alerts" className="card-link">Voir tout</Link>
                    </div>
                    <div className="card-content">
                        {securityAlerts.length === 0 ? (
                            <div className="empty-state">✅ Aucune alerte en cours. Le village est calme.</div>
                        ) : (
                            <div>
                                {securityAlerts.map((alert: any) => (
                                    <div key={alert.id} className="badge-alert">
                                        <div style={{ fontWeight: '700', color: '#991B1B', fontSize: '0.95rem' }}>{getAlertTypeLabel(alert.type)}</div>
                                        <div style={{ fontSize: '0.95rem', color: '#7F1D1D', marginTop: '4px', lineHeight: '1.5' }}>
                                            {alert.description}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="card col-span-2 span-2-md">
                    <div className="card-header">
                        <h3>📢 Annonces Mairie</h3>
                        <Link href="/official" className="card-link">Voir tout</Link>
                    </div>
                    <div className="card-content">
                        {officialAnnouncements.length === 0 ? (
                            <div className="empty-state">Aucune annonce officielle récente.</div>
                        ) : (
                            <div>
                                {officialAnnouncements.map((announcement: any) => (
                                    <div key={announcement.id} className="badge-official">
                                        <div style={{ fontWeight: '700', color: '#075985', fontSize: '0.95rem' }}>
                                            {getOfficialTypeLabel(announcement.type)}
                                        </div>
                                        <div style={{ fontSize: '0.95rem', color: '#0C4A6E', marginTop: '4px', lineHeight: '1.5' }}>
                                            {announcement.description}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. SECTION FEED */}

                {/* Agenda */}
                <div className="card col-span-1 accent-purple">
                    <div className="card-header">
                        <h3>📅 Agenda</h3>
                        <Link href="/events" className="card-link">Voir tout</Link>
                    </div>
                    <div className="card-content">
                        {(events.length === 0 && proAgendaEvents.length === 0) ? (
                            <div className="empty-state">Aucun événement à venir.</div>
                        ) : (
                            <div>
                                {events.map((event: any) => (
                                    <div key={`event-${event.id}`} className="item-row">
                                        <div style={{ fontWeight: '600', fontSize: '1rem', color: '#4B5563' }}>{event.title}</div>
                                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                            📅 {new Date(event.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', weekday: 'long' })}
                                        </div>
                                    </div>
                                ))}
                                {proAgendaEvents.map((ev: any) => (
                                    <div key={`pro-ev-${ev.id}`} className="item-row">
                                        <div style={{ fontWeight: '600', fontSize: '1rem', color: '#4B5563' }}>{ev.type === 'EVENT' ? '🎉' : ev.type === 'CLOSURE' ? '🔒' : '📅'} {ev.title}</div>
                                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                            📅 {new Date(ev.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} <span style={{ opacity: 0.5 }}>•</span> 📍 {ev.business.name}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Pros */}
                <div className="card col-span-1 accent-emerald">
                    <div className="card-header">
                        <h3>🏪 Actu Pros</h3>
                        <Link href="/village" className="card-link">Voir tout</Link>
                    </div>
                    <div className="card-content">
                        {proPosts.length === 0 ? (
                            <div className="empty-state">Aucune actualité pro.</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {proPosts.map((post: any) => (
                                    <Link key={post.id} href={`/village/pro/${post.business.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <div style={{
                                            padding: '12px',
                                            backgroundColor: '#F9FAFB',
                                            borderRadius: '8px',
                                            transition: 'background 0.2s',
                                            border: '1px solid #E5E7EB'
                                        }}>
                                            <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#111827', marginBottom: '4px' }}>{post.business.name}</div>
                                            <div style={{ fontSize: '0.9rem', color: '#4B5563', lineHeight: '1.5' }}>
                                                {post.content.length > 80 ? post.content.substring(0, 80) + '...' : post.content}
                                            </div>
                                            <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#6B7280', display: 'flex', gap: '12px' }}>
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

                {/* Marché */}
                <div className="card col-span-1 accent-amber">
                    <div className="card-header">
                        <h3>🛍️ Marché</h3>
                        <Link href="/market" className="card-link">Voir tout</Link>
                    </div>
                    <div className="card-content">
                        {listings.length === 0 ? (
                            <div className="empty-state">Rien à vendre pour l'instant.</div>
                        ) : (
                            <div>
                                {listings.map((listing: any) => (
                                    <div key={listing.id} className="item-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontWeight: '600', fontSize: '1rem', color: '#374151' }}>{listing.title}</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                {listing.category}
                                            </div>
                                        </div>
                                        {listing.price && (
                                            <div style={{ fontWeight: '700', color: '#D97706', fontSize: '1.1rem' }}>{listing.price}€</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
