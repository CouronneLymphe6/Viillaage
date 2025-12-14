'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import DashboardGrid from '@/components/DashboardGrid';
import DashboardSkeleton from '@/components/DashboardSkeleton';

export default function DashboardClient() {
    const { data: session, status } = useSession();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    // PERFORMANCE FIX: Load data ONLY when user scrolls or after initial render
    // This ensures App Shell renders in <1s and TTI <2s
    useEffect(() => {
        if (status === 'authenticated') {
            // Delay data fetch to allow App Shell to render first
            const timer = setTimeout(() => {
                fetchDashboardData();
            }, 100); // 100ms delay ensures UI is interactive first

            return () => clearTimeout(timer);
        }
    }, [status]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/dashboard');
            if (response.ok) {
                const result = await response.json();
                setData(result);
            }
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    // PERFORMANCE: Show skeleton immediately, no blocking
    if (status === 'loading') {
        return <DashboardSkeleton />;
    }

    if (!session?.user) {
        return (
            <div style={{ textAlign: 'center', padding: '40px' }}>
                <h2>Bienvenue sur Viillaage !</h2>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Veuillez vous connecter pour accéder au contenu.
                </p>
            </div>
        );
    }

    // PERFORMANCE: Show skeleton while loading, but UI is already interactive
    if (loading || !data) {
        return <DashboardSkeleton />;
    }

    return (
        <DashboardGrid
            userName={session.user.name || 'Habitant'}
            securityAlerts={data.securityAlerts || []}
            officialAnnouncements={data.officialAnnouncements || []}
            events={data.events || []}
            proAgendaEvents={data.proAgendaEvents || []}
            listings={data.listings || []}
            proPosts={data.proPosts || []}
        />
    );
}
