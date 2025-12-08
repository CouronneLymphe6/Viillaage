'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import ImageUpload from '@/components/ImageUpload';

interface Event {
    id: string;
    title: string;
    description: string;
    date: string;
    location?: string | null;
    photoUrl?: string | null;
    organizerId: string;
    organizer: {
        name: string | null;
    };
    rsvps: Array<{
        status: string;
        user: {
            name: string | null;
        };
    }>;
}

export default function EventsPage() {
    const { data: session } = useSession();
    const [events, setEvents] = useState<Event[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        location: '',
        photoUrl: '',
    });

    const [editingEvent, setEditingEvent] = useState<Event | null>(null);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const response = await fetch('/api/events');
            if (response.ok) {
                const data = await response.json();
                setEvents(data);
            }
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingEvent ? `/api/events/${editingEvent.id}` : '/api/events';
            const method = editingEvent ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setFormData({ title: '', description: '', date: '', location: '', photoUrl: '' });
                setShowForm(false);
                setEditingEvent(null);
                fetchEvents();
            }
        } catch (error) {
            console.error('Error saving event:', error);
        }
    };

    const handleEdit = (event: Event) => {
        setEditingEvent(event);
        setFormData({
            title: event.title,
            description: event.description,
            date: new Date(event.date).toISOString().slice(0, 16), // Format for datetime-local
            location: event.location || '',
            photoUrl: event.photoUrl || '',
        });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) return;

        try {
            const response = await fetch(`/api/events/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                fetchEvents();
            } else {
                alert('Erreur lors de la suppression');
            }
        } catch (error) {
            console.error('Error deleting event:', error);
        }
    };

    const handleRSVP = async (eventId: string, status: string) => {
        try {
            const response = await fetch('/api/rsvp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eventId, status }),
            });

            if (response.ok) {
                fetchEvents();
            }
        } catch (error) {
            console.error('Error RSVP:', error);
        }
    };

    return (
        <div>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: 'var(--spacing-xs)' }}>Agenda</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Événements du village</p>
                </div>
                <button
                    onClick={() => {
                        setEditingEvent(null);
                        setFormData({ title: '', description: '', date: '', location: '', photoUrl: '' });
                        setShowForm(!showForm);
                    }}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                    }}
                >
                    {showForm ? 'Annuler' : '+ Nouvel événement'}
                </button>
            </header>

            {showForm && (
                <div style={{
                    backgroundColor: 'var(--secondary)',
                    padding: 'var(--spacing-lg)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: 'var(--spacing-lg)',
                    boxShadow: 'var(--shadow-md)',
                }}>
                    <h3 style={{ marginBottom: 'var(--spacing-md)' }}>{editingEvent ? 'Modifier l\'événement' : 'Créer un événement'}</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                        <input
                            type="text"
                            placeholder="Titre de l'événement"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                            style={{
                                padding: '12px',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border)',
                                fontSize: '1rem',
                            }}
                        />
                        <textarea
                            placeholder="Description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                            rows={3}
                            style={{
                                padding: '12px',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border)',
                                fontSize: '1rem',
                                fontFamily: 'inherit',
                            }}
                        />
                        <input
                            type="datetime-local"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            required
                            style={{
                                padding: '12px',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border)',
                                fontSize: '1rem',
                            }}
                        />
                        <input
                            type="text"
                            placeholder="Lieu (optionnel)"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            style={{
                                padding: '12px',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border)',
                                fontSize: '1rem',
                            }}
                        />
                        <ImageUpload onUpload={(url) => setFormData({ ...formData, photoUrl: url })} currentImage={formData.photoUrl} />
                        <button
                            type="submit"
                            style={{
                                padding: '12px',
                                backgroundColor: 'var(--primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                            }}
                        >
                            {editingEvent ? 'Enregistrer les modifications' : 'Créer l\'événement'}
                        </button>
                    </form>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 'var(--spacing-md)' }}>
                {events.map((event) => {
                    const goingCount = event.rsvps.filter(r => r.status === 'GOING').length;
                    return (
                        <div
                            key={event.id}
                            style={{
                                backgroundColor: 'var(--secondary)',
                                padding: 'var(--spacing-md)',
                                borderRadius: 'var(--radius-md)',
                                boxShadow: 'var(--shadow-sm)',
                            }}
                        >
                            {event.photoUrl && (
                                <img
                                    src={event.photoUrl}
                                    alt={event.title}
                                    style={{
                                        width: '100%',
                                        height: '200px',
                                        objectFit: 'cover',
                                        borderRadius: 'var(--radius-sm)',
                                        marginBottom: 'var(--spacing-sm)'
                                    }}
                                />
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <h3 style={{ marginBottom: 'var(--spacing-xs)', color: 'var(--primary)' }}>{event.title}</h3>
                                {session?.user?.id === event.organizerId && (
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={() => handleEdit(event)}
                                            style={{
                                                backgroundColor: 'transparent',
                                                color: 'var(--primary)',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontSize: '0.9rem',
                                            }}
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => handleDelete(event.id)}
                                            style={{
                                                backgroundColor: 'transparent',
                                                color: 'red',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontSize: '0.9rem',
                                            }}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                )}
                            </div>
                            <p style={{ marginBottom: 'var(--spacing-sm)', color: 'var(--text-main)' }}>{event.description}</p>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-sm)' }}>
                                <div>📅 {new Date(event.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</div>
                                {event.location && <div>📍 {event.location}</div>}
                                <div>👤 Organisé par {event.organizer.name || 'Anonyme'}</div>
                                <div>✅ {goingCount} participant{goingCount > 1 ? 's' : ''}</div>
                            </div>
                            <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
                                <button
                                    onClick={() => handleRSVP(event.id, 'GOING')}
                                    style={{
                                        flex: 1,
                                        padding: '8px',
                                        backgroundColor: '#10B981',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: 'var(--radius-sm)',
                                        fontSize: '0.9rem',
                                        cursor: 'pointer',
                                    }}
                                >
                                    ✓ J'y vais
                                </button>
                                <button
                                    onClick={() => handleRSVP(event.id, 'MAYBE')}
                                    style={{
                                        flex: 1,
                                        padding: '8px',
                                        backgroundColor: '#F59E0B',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: 'var(--radius-sm)',
                                        fontSize: '0.9rem',
                                        cursor: 'pointer',
                                    }}
                                >
                                    ? Peut-être
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
