'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { Alert } from '@/types';

// Couleurs de punaises harmonisées avec le thème Village
const PIN_COLORS = ['#00BFA5', '#008F7A', '#00897B', '#00695C', '#004D40', '#26A69A'];

export default function OfficialPage() {
    const { data: session } = useSession();
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingAlert, setEditingAlert] = useState<Alert | null>(null);
    const [formData, setFormData] = useState({
        type: 'OFFICIAL_INFO',
        description: '',
    });

    const fetchOfficialAlerts = async () => {
        try {
            const response = await fetch('/api/alerts');
            if (response.ok) {
                const data = await response.json();
                const official = data.filter((a: Alert) => a.type.startsWith('OFFICIAL_'));
                setAlerts(official);
            }
        } catch (error) {
            console.error('Error fetching official alerts:', error);
        }
    };

    useEffect(() => {
        fetchOfficialAlerts();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // OPTIMISTIC UI: Add/Update immediately
        const previousAlerts = [...alerts];

        if (editingAlert) {
            // Update existing
            setAlerts(alerts.map(a =>
                a.id === editingAlert.id
                    ? { ...a, ...formData }
                    : a
            ));
        } else {
            // Create new with temp ID
            const tempAlert: Alert = {
                id: 'temp-' + Date.now(),
                ...formData,
                latitude: 0,
                longitude: 0,
                userId: session?.user?.id || '',
                createdAt: new Date().toISOString(),
                user: {
                    id: session?.user?.id || '',
                    name: session?.user?.name || null,
                },
                confirmations: 0,
                reports: 0,
            };
            setAlerts([tempAlert, ...alerts]);
        }

        setShowForm(false);
        setEditingAlert(null);
        setFormData({ type: 'OFFICIAL_INFO', description: '' });

        try {
            const url = editingAlert ? `/api/alerts/${editingAlert.id}` : '/api/alerts';
            const method = editingAlert ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    latitude: 0,
                    longitude: 0,
                }),
            });

            if (response.ok) {
                if (!editingAlert) {
                    // Replace temp with real data
                    const realAlert = await response.json();
                    setAlerts(prev => prev.map(a =>
                        a.id.startsWith('temp-') ? realAlert : a
                    ));
                }
            } else {
                // Rollback on error
                setAlerts(previousAlerts);
                alert('Erreur lors de l\'enregistrement');
            }
        } catch (error) {
            // Rollback on error
            setAlerts(previousAlerts);
            console.error(error);
            alert('Erreur lors de l\'enregistrement');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Supprimer cette annonce officielle ?')) return;

        // OPTIMISTIC UI: Remove immediately
        const previousAlerts = [...alerts];
        setAlerts(alerts.filter(a => a.id !== id));

        try {
            const response = await fetch(`/api/alerts/${id}`, { method: 'DELETE' });

            if (!response.ok) {
                // Rollback on error
                setAlerts(previousAlerts);
                alert('Erreur lors de la suppression');
            }
        } catch (error) {
            // Rollback on error
            setAlerts(previousAlerts);
            console.error(error);
            alert('Erreur lors de la suppression');
        }
    };

    const handleEdit = (alert: Alert) => {
        setEditingAlert(alert);
        setFormData({
            type: alert.type,
            description: alert.description,
        });
        setShowForm(true);
    };

    const getTypeLabel = (type: string): string => {
        const typeMap: Record<string, string> = {
            'OFFICIAL_DECREE': 'Arrêté municipal',
            'OFFICIAL_INFO': 'Information',
            'OFFICIAL_WARNING': 'Avertissement',
            'OFFICIAL_EVENT': 'Événement officiel',
            'OFFICIAL_WORK': 'Travaux',
        };
        return typeMap[type] || type.replace('OFFICIAL_', '').replace('_', ' ');
    };

    const getTypeIcon = (type: string): string => {
        const iconMap: Record<string, string> = {
            'OFFICIAL_DECREE': '📜',
            'OFFICIAL_INFO': 'ℹ️',
            'OFFICIAL_WARNING': '⚠️',
            'OFFICIAL_EVENT': '🎉',
            'OFFICIAL_WORK': '🚧',
        };
        return iconMap[type] || '📌';
    };

    return (
        <div style={{ minHeight: '100vh' }}>
            {/* Header avec thème Village */}
            <header
                className="official-header"
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '32px',
                    padding: '24px 28px',
                    background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F7FA 100%)',
                    borderRadius: 'var(--radius-lg)',
                    border: '3px solid var(--primary)',
                    boxShadow: 'var(--shadow-md)',
                }}>
                <div>
                    <h1
                        className="official-title"
                        style={{
                            fontSize: '2.5rem',
                            marginBottom: '8px',
                            color: 'var(--accent)',
                            fontFamily: 'Poppins, sans-serif',
                            fontWeight: '700',
                        }}>
                        📋 Panneau Officiel
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Informations de la Mairie</p>
                </div>
                {session?.user?.role === 'ADMIN' && (
                    <button
                        className="official-button"
                        onClick={() => {
                            setEditingAlert(null);
                            setFormData({ type: 'OFFICIAL_INFO', description: '' });
                            setShowForm(!showForm);
                        }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '14px 28px',
                            backgroundColor: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '1rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(0, 191, 165, 0.3)',
                            transition: 'all 0.3s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.backgroundColor = 'var(--primary-dark)';
                            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 191, 165, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.backgroundColor = 'var(--primary)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 191, 165, 0.3)';
                        }}
                    >
                        <Plus size={20} />
                        {showForm ? 'Annuler' : 'Nouvelle annonce'}
                    </button>
                )}
            </header>

            {/* Form Modal avec thème Village */}
            {showForm && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(38, 50, 56, 0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '20px',
                    backdropFilter: 'blur(4px)',
                }}>
                    <div style={{
                        backgroundColor: 'var(--secondary)',
                        padding: '32px',
                        borderRadius: 'var(--radius-lg)',
                        maxWidth: '600px',
                        width: '100%',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                        border: '2px solid var(--primary)',
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
                                color: 'var(--text-secondary)',
                                transition: 'color 0.2s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                        >
                            <X size={24} />
                        </button>

                        <h3 style={{
                            marginBottom: '24px',
                            fontSize: '1.8rem',
                            color: 'var(--accent)',
                            fontFamily: 'Poppins, sans-serif',
                            fontWeight: '700',
                        }}>
                            {editingAlert ? 'Modifier l\'annonce' : 'Nouvelle annonce officielle'}
                        </h3>

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    fontWeight: '600',
                                    color: 'var(--text-main)',
                                    fontSize: '0.95rem',
                                }}>
                                    Type d'annonce
                                </label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        border: '2px solid var(--border)',
                                        borderRadius: 'var(--radius-md)',
                                        fontSize: '1rem',
                                        backgroundColor: 'var(--background)',
                                        color: 'var(--text-main)',
                                        transition: 'border-color 0.2s',
                                        outline: 'none',
                                    }}
                                    onFocus={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                                    onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                                >
                                    <option value="OFFICIAL_INFO">ℹ️ Information</option>
                                    <option value="OFFICIAL_DECREE">📜 Arrêté municipal</option>
                                    <option value="OFFICIAL_WARNING">⚠️ Avertissement</option>
                                    <option value="OFFICIAL_EVENT">🎉 Événement officiel</option>
                                    <option value="OFFICIAL_WORK">🚧 Travaux</option>
                                </select>
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    fontWeight: '600',
                                    color: 'var(--text-main)',
                                    fontSize: '0.95rem',
                                }}>
                                    Message
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                    rows={6}
                                    placeholder="Rédigez votre annonce officielle..."
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        border: '2px solid var(--border)',
                                        borderRadius: 'var(--radius-md)',
                                        fontSize: '1rem',
                                        fontFamily: 'inherit',
                                        resize: 'vertical',
                                        backgroundColor: 'var(--background)',
                                        color: 'var(--text-main)',
                                        lineHeight: '1.6',
                                        transition: 'border-color 0.2s',
                                        outline: 'none',
                                    }}
                                    onFocus={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                                    onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                                />
                            </div>

                            <button
                                type="submit"
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    backgroundColor: 'var(--primary)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 'var(--radius-md)',
                                    fontSize: '1.1rem',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 12px rgba(0, 191, 165, 0.3)',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'var(--primary-dark)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'var(--primary)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                {editingAlert ? 'Modifier' : 'Publier'} l'annonce
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Wooden Board Background - Harmonisé avec le thème */}
            <div
                className="official-board"
                style={{
                    background: 'linear-gradient(135deg, #455A64 0%, #37474F 50%, #263238 100%)',
                    padding: '40px',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'inset 0 0 100px rgba(0,0,0,0.3), var(--shadow-lg)',
                    border: '6px solid var(--accent)',
                    position: 'relative',
                    minHeight: '600px',
                    backgroundImage: `
                        repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px),
                        repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)
                    `,
                }}>
                {/* Texture overlay */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    opacity: 0.05,
                    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 11px)',
                    pointerEvents: 'none',
                    borderRadius: 'var(--radius-lg)',
                }} />

                {/* Notices Grid */}
                <div
                    className="official-grid"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '40px',
                        position: 'relative',
                    }}>
                    {alerts.length === 0 ? (
                        <div style={{
                            gridColumn: '1 / -1',
                            textAlign: 'center',
                            padding: '60px 20px',
                            color: 'rgba(255,255,255,0.7)',
                            fontSize: '1.2rem',
                        }}>
                            📌 Aucune annonce officielle pour le moment
                        </div>
                    ) : (
                        alerts.map((alert, index) => {
                            const pinColor = PIN_COLORS[index % PIN_COLORS.length];
                            const rotation = (index % 2 === 0 ? 1 : -1) * (Math.random() * 2 + 1);
                            const isOwner = session?.user?.id === alert.userId || session?.user?.role === 'ADMIN';

                            return (
                                <div
                                    key={alert.id}
                                    className="official-card-container"
                                    style={{
                                        position: 'relative',
                                        transform: `rotate(${rotation}deg)`,
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'rotate(0deg) scale(1.02)';
                                        e.currentTarget.style.zIndex = '10';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = `rotate(${rotation}deg) scale(1)`;
                                        e.currentTarget.style.zIndex = '1';
                                    }}
                                >
                                    {/* Pushpin - Couleurs du thème */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '-12px',
                                        left: '50%',
                                        width: '24px',
                                        height: '24px',
                                        backgroundColor: pinColor,
                                        borderRadius: '50% 50% 50% 0',
                                        transform: 'translateX(-50%) rotate(45deg)',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.3), inset -2px -2px 4px rgba(0,0,0,0.2)',
                                        zIndex: 2,
                                    }}>
                                        <div style={{
                                            position: 'absolute',
                                            top: '50%',
                                            left: '50%',
                                            transform: 'translate(-50%, -50%)',
                                            width: '8px',
                                            height: '8px',
                                            backgroundColor: 'rgba(255,255,255,0.4)',
                                            borderRadius: '50%',
                                        }} />
                                    </div>

                                    {/* Paper Notice - Thème Village */}
                                    <div
                                        className="official-notice"
                                        style={{
                                            backgroundColor: 'var(--secondary)',
                                            padding: '24px',
                                            borderRadius: 'var(--radius-md)',
                                            boxShadow: '0 8px 24px rgba(0,0,0,0.4), 0 0 0 1px var(--border)',
                                            position: 'relative',
                                            minHeight: '200px',
                                            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 24px, var(--background) 24px, var(--background) 25px)',
                                        }}>
                                        {/* Owner Actions */}
                                        {isOwner && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '12px',
                                                right: '12px',
                                                display: 'flex',
                                                gap: '8px',
                                            }}>
                                                <button
                                                    onClick={() => handleEdit(alert)}
                                                    style={{
                                                        padding: '6px',
                                                        backgroundColor: 'var(--primary)',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: 'var(--radius-sm)',
                                                        cursor: 'pointer',
                                                        boxShadow: 'var(--shadow-sm)',
                                                        transition: 'all 0.2s',
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-dark)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
                                                    title="Modifier"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(alert.id)}
                                                    style={{
                                                        padding: '6px',
                                                        backgroundColor: '#e74c3c',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: 'var(--radius-sm)',
                                                        cursor: 'pointer',
                                                        boxShadow: 'var(--shadow-sm)',
                                                        transition: 'all 0.2s',
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c0392b'}
                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#e74c3c'}
                                                    title="Supprimer"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        )}

                                        {/* Type Badge - Couleurs du thème */}
                                        <div style={{
                                            display: 'inline-block',
                                            padding: '6px 14px',
                                            backgroundColor: pinColor,
                                            color: 'white',
                                            borderRadius: 'var(--radius-full)',
                                            fontSize: '0.85rem',
                                            fontWeight: '700',
                                            marginBottom: '16px',
                                            boxShadow: 'var(--shadow-sm)',
                                        }}>
                                            {getTypeIcon(alert.type)} {getTypeLabel(alert.type)}
                                        </div>

                                        {/* Content */}
                                        <p style={{
                                            color: 'var(--text-main)',
                                            lineHeight: '1.8',
                                            fontSize: '1rem',
                                            whiteSpace: 'pre-wrap',
                                            wordBreak: 'break-word',
                                        }}>
                                            {alert.description}
                                        </p>

                                        {/* Date */}
                                        <div style={{
                                            marginTop: '16px',
                                            paddingTop: '12px',
                                            borderTop: '1px dashed var(--border)',
                                            fontSize: '0.85rem',
                                            color: 'var(--text-secondary)',
                                            fontStyle: 'italic',
                                        }}>
                                            📅 {new Date(alert.createdAt).toLocaleDateString('fr-FR', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </div>

                                        {/* Tape effect - Couleur du thème */}
                                        <div style={{
                                            position: 'absolute',
                                            top: '-4px',
                                            right: '20px',
                                            width: '60px',
                                            height: '20px',
                                            backgroundColor: 'rgba(0, 191, 165, 0.2)',
                                            transform: 'rotate(-5deg)',
                                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                        }} />
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
            <style jsx global>{`
                @media (max-width: 768px) {
                    .official-header {
                        flex-direction: column;
                        align-items: flex-start !important;
                        gap: 16px;
                        padding: 20px !important;
                    }
                    .official-title {
                        font-size: 1.8rem !important;
                    }
                    .official-button {
                        width: 100%;
                        justify-content: center;
                    }
                    .official-board {
                        padding: 16px !important;
                        min-height: auto !important;
                    }
                    .official-grid {
                        grid-template-columns: 1fr !important;
                        gap: 24px !important;
                    }
                    .official-notice {
                        padding: 16px !important;
                        min-height: auto !important;
                    }
                    .official-notice p {
                        font-size: 0.9rem !important;
                        line-height: 1.6 !important;
                    }
                    /* Désactiver la rotation sur mobile pour gagner de la place */
                    .official-card-container {
                        transform: none !important;
                        margin-bottom: 8px;
                    }
                    .official-card-container:hover {
                         transform: none !important;
                    }
                }
            `}</style>
        </div>
    );
}
