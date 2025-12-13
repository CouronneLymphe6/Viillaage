'use client';

import { useState, useEffect, useRef } from 'react';
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
    const [mapClickCallback, setMapClickCallback] = useState<((lat: number, lon: number) => void) | null>(null);
    const [formMinimized, setFormMinimized] = useState(false);

    // Utiliser une ref pour préserver le callback
    const callbackRef = useRef<((lat: number, lon: number) => void) | null>(null);

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
        // OPTIMISTIC UI: Update vote count immediately
        const previousAlerts = [...alerts];
        setAlerts(alerts.map(alert => {
            if (alert.id === id) {
                return {
                    ...alert,
                    userVote: type,
                    confirmations: type === 'CONFIRM' ? (alert.confirmations || 0) + 1 : alert.confirmations,
                    reports: type === 'REPORT' ? (alert.reports || 0) + 1 : alert.reports,
                };
            }
            return alert;
        }));

        try {
            const response = await fetch(`/api/alerts/${id}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type }),
            });

            if (!response.ok) {
                // Rollback on error
                setAlerts(previousAlerts);
                const err = await response.text();
                if (response.status === 409) {
                    alert("Vous avez déjà voté !");
                } else {
                    console.error("Vote error:", err);
                    alert("Erreur lors du vote");
                }
            }
            // Success: vote already updated in UI
        } catch (error) {
            // Rollback on error
            setAlerts(previousAlerts);
            console.error('Error voting:', error);
            alert("Erreur lors du vote");
        }
    };

    const handleFormSuccess = () => {
        setShowForm(false);
        setEditingAlert(null);
        fetchAlerts();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette alerte ?')) return;

        // OPTIMISTIC UI: Remove immediately from UI
        const previousAlerts = [...alerts];
        setAlerts(alerts.filter(alert => alert.id !== id));

        try {
            const response = await fetch(`/api/alerts/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                // Rollback on error
                setAlerts(previousAlerts);
                const err = await response.text();
                alert(`Erreur lors de la suppression: ${err}`);
            }
            // Success: alert already removed from UI, no need to refetch
        } catch (error) {
            // Rollback on error
            setAlerts(previousAlerts);
            console.error('Error deleting alert:', error);
            alert('Erreur lors de la suppression');
        }
    };

    const handleEdit = (alert: Alert) => {
        setEditingAlert(alert);
        setShowForm(true);
    };

    const handleRequestMapClick = (callback: (lat: number, lon: number) => void) => {
        console.log('📝 Enregistrement du callback');
        callbackRef.current = callback; // Stocker dans la ref
        setFormMinimized(true); // Minimiser le formulaire
        setMapClickCallback(() => callback); // Pour activer le mode clic
    };

    const handleMapClick = (lat: number, lon: number) => {
        console.log('🖱️ Clic sur carte détecté:', lat, lon);
        console.log('📞 Callback dans ref?', !!callbackRef.current);
        if (callbackRef.current) {
            callbackRef.current(lat, lon);
            callbackRef.current = null; // Nettoyer la ref
            setMapClickCallback(null); // Désactiver après un clic
            setFormMinimized(false); // Restaurer le formulaire
            console.log('✅ Callback exécuté et formulaire restauré');
        } else {
            console.warn('⚠️ Pas de callback défini');
        }
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
                    onMapClick={mapClickCallback ? handleMapClick : undefined}
                    clickMode={!!mapClickCallback}
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
                    backgroundColor: formMinimized ? 'transparent' : 'rgba(0,0,0,0.5)',
                    zIndex: 2000,
                    display: 'flex',
                    alignItems: formMinimized ? 'flex-end' : 'center',
                    justifyContent: formMinimized ? 'flex-end' : 'center',
                    padding: formMinimized ? '0' : 'var(--spacing-md)',
                    pointerEvents: formMinimized ? 'none' : 'auto',
                }}>
                    <div style={{
                        backgroundColor: 'var(--background)',
                        padding: 'var(--spacing-lg)',
                        borderRadius: 'var(--radius-md)',
                        width: formMinimized ? '300px' : '100%',
                        maxWidth: formMinimized ? '300px' : '500px',
                        maxHeight: formMinimized ? '80px' : '90vh',
                        overflowY: formMinimized ? 'hidden' : 'auto',
                        position: 'relative',
                        margin: formMinimized ? '16px' : '0',
                        pointerEvents: 'auto',
                        transition: 'all 0.3s ease',
                    }}>
                        {/* Mode MINIMISÉ */}
                        <div style={{ display: formMinimized ? 'block' : 'none', textAlign: 'center' }}>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                👆 Cliquez sur la carte pour sélectionner la position
                            </p>
                            <button
                                onClick={() => {
                                    setFormMinimized(false);
                                    setMapClickCallback(null);
                                }}
                                style={{
                                    marginTop: '8px',
                                    padding: '6px 12px',
                                    backgroundColor: 'var(--primary)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 'var(--radius-sm)',
                                    fontSize: '0.85rem',
                                    cursor: 'pointer',
                                }}
                            >
                                Annuler
                            </button>
                        </div>

                        {/* Mode NORMAL */}
                        <div style={{ display: formMinimized ? 'none' : 'block' }}>
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
                            <AlertForm
                                onSuccess={handleFormSuccess}
                                initialData={editingAlert}
                                onRequestMapClick={handleRequestMapClick}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
