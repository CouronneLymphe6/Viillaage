'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import AlertForm from '@/components/AlertForm';
import { Alert } from '@/types';
import { Plus, X } from 'lucide-react';

// Dynamic import to avoid SSR issues with Leaflet
const Map = dynamic(() => import('@/components/Map'), { ssr: false });

export default function AlertsPage() {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [mapCenter, setMapCenter] = useState<[number, number]>([43.6487, 1.5536]); // Beaupuy
    const [editingAlert, setEditingAlert] = useState<Alert | null>(null);

    const fetchAlerts = async () => {
        try {
            const response = await fetch('/api/alerts');
            if (response.ok) {
                const data = await response.json();
                // Filter OUT official announcements - only show security alerts
                const securityAlerts = data.filter((a: Alert) => !a.type.startsWith('OFFICIAL_'));
                setAlerts(securityAlerts);
            }
        } catch (error) {
            console.error('Error fetching alerts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
    }, []);

    const handleVote = async (id: string, type: 'CONFIRM' | 'REPORT') => {
        try {
            const response = await fetch(`/api/alerts/${id}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type }),
            });

            if (response.ok) {
                fetchAlerts();
            } else {
                const err = await response.text();
                if (response.status === 409) {
                    alert("Vous avez déjà voté !");
                } else {
                    console.error("Vote error:", err);
                }
            }
        } catch (error) {
            console.error('Error voting:', error);
        }
    };

    const handleFormSuccess = () => {
        setShowForm(false);
        setEditingAlert(null);
        fetchAlerts();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette alerte ?')) return;

        try {
            const response = await fetch(`/api/alerts/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                fetchAlerts();
            } else {
                const err = await response.text();
                alert(`Erreur lors de la suppression: ${err}`);
            }
        } catch (error) {
            console.error('Error deleting alert:', error);
            alert('Erreur lors de la suppression');
        }
    };

    const handleEdit = (alert: Alert) => {
        setEditingAlert(alert);
        setShowForm(true);
    };

    return (
        <div style={{ height: 'calc(100vh - 64px)', position: 'relative' }}>
            {/* Full-screen Map */}
            {loading ? (
                <div style={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'var(--secondary)',
                }}>
                    Chargement de la carte...
                </div>
            ) : (
                <Map
                    alerts={alerts}
                    center={mapCenter}
                    onVote={handleVote}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                />
            )}

            {/* Floating Action Button for New Alert */}
            <button
                onClick={() => {
                    setEditingAlert(null);
                    setShowForm(true);
                }}
                style={{
                    position: 'absolute',
                    bottom: '24px',
                    right: '24px',
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 1000,
                }}
            >
                <Plus size={28} />
            </button>

            {/* Modal Form Overlay */}
            {showForm && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    zIndex: 2000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 'var(--spacing-md)',
                }}>
                    <div style={{
                        backgroundColor: 'var(--background)',
                        padding: 'var(--spacing-lg)',
                        borderRadius: 'var(--radius-md)',
                        width: '100%',
                        maxWidth: '500px',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        position: 'relative',
                    }}>
                        <button
                            onClick={() => setShowForm(false)}
                            style={{
                                position: 'absolute',
                                top: '16px',
                                right: '16px',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                            }}
                        >
                            <X size={24} />
                        </button>
                        <h3 style={{ marginBottom: 'var(--spacing-md)' }}>{editingAlert ? 'Modifier l\'alerte' : 'Nouveau signalement'}</h3>
                        <AlertForm onSuccess={handleFormSuccess} initialData={editingAlert} />
                    </div>
                </div>
            )}
        </div>
    );
}
