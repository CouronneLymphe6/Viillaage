'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import DashboardGrid from '@/components/DashboardGrid';
import DashboardSkeleton from '@/components/DashboardSkeleton';

export default function DashboardClient() {
    const { data: session, status } = useSession();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'authenticated') {
            fetchDashboardData();
        }
    }, [status]);

    const fetchDashboardData = async () => {
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

    if (status === 'loading' || loading) {
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

    if (!data) {
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
