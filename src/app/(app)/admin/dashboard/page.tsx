'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Loader from '@/components/Loader';
interface Stats {
    users: {
        total: number;
        newLast7Days: number;
        growth7d: string;
    };
    villages: {
        total: number;
    };
    businesses: {
        total: number;
    };
    associations: {
        total: number;
    };
    events: {
        total: number;
        newLast7Days: number;
    };
    contact: {
        total: number;
        unread: number;
    };
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/admin/stats');
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}><Loader size="large" text="Chargement du tableau de bord..." /></div>;
    }

    return (
        <div>
            <h1 style={{ fontSize: '2rem', marginBottom: 'var(--spacing-xl)', fontWeight: '700' }}>
                Dashboard Administrateur
            </h1>

            {/* KPI Cards Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: 'var(--spacing-lg)',
                marginBottom: 'var(--spacing-xl)'
            }}>
                {/* Users Card */}
                <div style={{
                    backgroundColor: 'white',
                    padding: 'var(--spacing-lg)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-md)',
                    border: '1px solid var(--border)'
                }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                        Utilisateurs
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: 'var(--spacing-xs)' }}>
                        {stats?.users.total || 0}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#10b981' }}>
                        {stats?.users.growth7d} cette semaine
                    </div>
                </div>

                {/* Villages Card */}
                <div style={{
                    backgroundColor: 'white',
                    padding: 'var(--spacing-lg)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-md)',
                    border: '1px solid var(--border)'
                }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                        Villages
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: '700' }}>
                        {stats?.villages.total || 0}
                    </div>
                </div>

                {/* Businesses Card */}
                <div style={{
                    backgroundColor: 'white',
                    padding: 'var(--spacing-lg)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-md)',
                    border: '1px solid var(--border)'
                }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                        Commerces
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: '700' }}>
                        {stats?.businesses.total || 0}
                    </div>
                </div>

                {/* Associations Card */}
                <div style={{
                    backgroundColor: 'white',
                    padding: 'var(--spacing-lg)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-md)',
                    border: '1px solid var(--border)'
                }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                        Associations
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: '700' }}>
                        {stats?.associations.total || 0}
                    </div>
                </div>

                {/* Events Card */}
                <div style={{
                    backgroundColor: 'white',
                    padding: 'var(--spacing-lg)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-md)',
                    border: '1px solid var(--border)'
                }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                        Événements
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: 'var(--spacing-xs)' }}>
                        {stats?.events.total || 0}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#10b981' }}>
                        +{stats?.events.newLast7Days || 0} cette semaine
                    </div>
                </div>

                {/* Contact Messages Card */}
                <div style={{
                    backgroundColor: 'white',
                    padding: 'var(--spacing-lg)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-md)',
                    border: '1px solid var(--border)',
                    borderLeft: stats?.contact.unread ? '4px solid #ef4444' : '1px solid var(--border)'
                }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                        Messages de contact
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: ' var(--spacing-xs)' }}>
                        {stats?.contact.total || 0}
                    </div>
                    {stats && stats.contact.unread > 0 && (
                        <div style={{ fontSize: '0.875rem', color: '#ef4444', fontWeight: '600' }}>
                            {stats.contact.unread} non lu{stats.contact.unread > 1 ? 's' : ''}
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div style={{
                backgroundColor: 'white',
                padding: 'var(--spacing-lg)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-md)',
                border: '1px solid var(--border)'
            }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: 'var(--spacing-md)' }}>
                    Actions rapides
                </h2>
                <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
                    <a
                        href="/admin/contact-messages"
                        style={{
                            padding: 'var(--spacing-sm) var(--spacing-lg)',
                            backgroundColor: 'var(--primary)',
                            color: 'white',
                            borderRadius: 'var(--radius-md)',
                            textDecoration: 'none',
                            fontWeight: '600'
                        }}
                    >
                        Voir les messages
                    </a>
                    <a
                        href="/admin/users"
                        style={{
                            padding: 'var(--spacing-sm) var(--spacing-lg)',
                            backgroundColor: '#6b7280',
                            color: 'white',
                            borderRadius: 'var(--radius-md)',
                            textDecoration: 'none',
                            fontWeight: '600'
                        }}
                    >
                        Gérer les utilisateurs
                    </a>
                </div>
            </div>
        </div>
    );
}
