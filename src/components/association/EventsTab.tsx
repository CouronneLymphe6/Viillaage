'use client';

import { useState, useEffect } from 'react';
import { Calendar, Plus } from 'lucide-react';

interface AssociationEvent {
    id: string;
    title: string;
    description?: string | null;
    type: string;
    startDate: string;
    endDate: string;
    location?: string | null;
}

interface EventsTabProps {
    associationId: string;
    isOwner: boolean;
}

export function EventsTab({ associationId, isOwner }: EventsTabProps) {
    const [events, setEvents] = useState<AssociationEvent[]>([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchEvents();
    }, [associationId]);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/associations/${associationId}/events`);
            if (response.ok) {
                const data = await response.json();
                setEvents(data);
            }
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Chargement...</p>;
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0 }}>Événements</h2>
                {isOwner && (
                    <button
                        onClick={() => setShowForm(true)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 16px',
                            backgroundColor: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            fontWeight: '600',
                            cursor: 'pointer',
                        }}
                    >
                        <Plus size={18} />
                        Ajouter
                    </button>
                )}
            </div>

            {events.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <Calendar size={48} style={{ color: 'var(--text-secondary)', marginBottom: '16px' }} />
                    <p style={{ color: 'var(--text-secondary)' }}>
                        {isOwner ? 'Ajoutez votre premier événement' : 'Aucun événement prévu'}
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {events.map((event) => {
                        const startDate = new Date(event.startDate);
                        const endDate = new Date(event.endDate);
                        const typeEmoji = event.type === 'MEETING' ? '🤝' : event.type === 'ACTIVITY' ? '🎯' : event.type === 'FUNDRAISING' ? '💰' : '📅';

                        return (
                            <div key={event.id} style={{
                                backgroundColor: 'var(--secondary)',
                                padding: '16px',
                                borderRadius: 'var(--radius-md)',
                                borderLeft: '4px solid var(--primary)',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                    <div style={{ fontSize: '2rem' }}>{typeEmoji}</div>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{event.title}</h3>
                                        {event.description && (
                                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '8px' }}>
                                                {event.description}
                                            </p>
                                        )}
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                            📅 {startDate.toLocaleDateString('fr-FR')} - {endDate.toLocaleDateString('fr-FR')}
                                        </p>
                                        {event.location && (
                                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                📍 {event.location}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {showForm && (
                <EventForm
                    associationId={associationId}
                    onClose={() => setShowForm(false)}
                    onSuccess={() => {
                        fetchEvents();
                        setShowForm(false);
                    }}
                />
            )}
        </div>
    );
}

function EventForm({ associationId, onClose, onSuccess }: { associationId: string, onClose: () => void, onSuccess: () => void }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'MEETING',
        startDate: '',
        endDate: '',
        location: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch(`/api/associations/${associationId}/events`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                onSuccess();
            }
        } catch (error) {
            console.error('Error creating event:', error);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
        }} onClick={onClose}>
            <div onClick={(e) => e.stopPropagation()} style={{
                backgroundColor: 'var(--secondary)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                maxWidth: '500px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
            }}>
                <h2 style={{ marginBottom: '20px' }}>Ajouter un événement</h2>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Titre *</label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '2px solid var(--border)',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '1rem',
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '2px solid var(--border)',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '1rem',
                                resize: 'vertical',
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Type *</label>
                        <select
                            required
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '2px solid var(--border)',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '1rem',
                            }}
                        >
                            <option value="MEETING">🤝 Réunion</option>
                            <option value="ACTIVITY">🎯 Activité</option>
                            <option value="FUNDRAISING">💰 Collecte de fonds</option>
                            <option value="OTHER">📅 Autre</option>
                        </select>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Lieu</label>
                        <input
                            type="text"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '2px solid var(--border)',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '1rem',
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Date de début *</label>
                        <input
                            type="datetime-local"
                            required
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '2px solid var(--border)',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '1rem',
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Date de fin *</label>
                        <input
                            type="datetime-local"
                            required
                            value={formData.endDate}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '2px solid var(--border)',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '1rem',
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                flex: 1,
                                padding: '12px',
                                backgroundColor: 'var(--background)',
                                border: '2px solid var(--border)',
                                borderRadius: 'var(--radius-md)',
                                fontWeight: '600',
                                cursor: 'pointer',
                            }}
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            style={{
                                flex: 1,
                                padding: '12px',
                                backgroundColor: 'var(--primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: 'var(--radius-md)',
                                fontWeight: '600',
                                cursor: 'pointer',
                            }}
                        >
                            Ajouter
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
