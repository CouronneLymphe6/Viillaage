'use client';

import { useEffect, useState } from 'react';

interface ContactMessage {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: 'NEW' | 'READ' | 'ARCHIVED';
    createdAt: string;
}

export default function ContactMessagesPage() {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'NEW' | 'READ' | 'ARCHIVED'>('all');
    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

    useEffect(() => {
        fetchMessages();
    }, [filter]);

    const fetchMessages = async () => {
        try {
            const url = filter === 'all'
                ? '/api/admin/contact-messages'
                : `/api/admin/contact-messages?status=${filter}`;

            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setMessages(data.messages);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, status: string) => {
        try {
            await fetch('/api/admin/contact-messages', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status })
            });
            fetchMessages();
            if (selectedMessage?.id === id) {
                setSelectedMessage({ ...selectedMessage, status: status as any });
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const deleteMessage = async (id: string) => {
        if (!confirm('Voulez-vous vraiment supprimer ce message ?')) return;

        try {
            await fetch(`/api/admin/contact-messages?id=${id}`, {
                method: 'DELETE'
            });
            fetchMessages();
            setSelectedMessage(null);
        } catch (error) {
            console.error('Error deleting message:', error);
        }
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            NEW: { bg: '#fef3c7', color: '#92400e', label: 'Nouveau' },
            READ: { bg: '#dbeafe', color: '#1e40af', label: 'Lu' },
            ARCHIVED: { bg: '#f3f4f6', color: '#374151', label: 'Archivé' }
        };
        const style = styles[status as keyof typeof styles];
        return (
            <span style={{
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: '600',
                backgroundColor: style.bg,
                color: style.color
            }}>
                {style.label}
            </span>
        );
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '700' }}>Messages de Contact</h1>

                {/* Filters */}
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                    <button
                        onClick={() => setFilter('all')}
                        style={{
                            padding: 'var(--spacing-sm) var(--spacing-md)',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: filter === 'all' ? 'var(--primary)' : '#e5e7eb',
                            color: filter === 'all' ? 'white' : '#374151',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        Tous
                    </button>
                    <button
                        onClick={() => setFilter('NEW')}
                        style={{
                            padding: 'var(--spacing-sm) var(--spacing-md)',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: filter === 'NEW' ? 'var(--primary)' : '#e5e7eb',
                            color: filter === 'NEW' ? 'white' : '#374151',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        Nouveaux
                    </button>
                    <button
                        onClick={() => setFilter('READ')}
                        style={{
                            padding: 'var(--spacing-sm) var(--spacing-md)',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: filter === 'READ' ? 'var(--primary)' : '#e5e7eb',
                            color: filter === 'READ' ? 'white' : '#374151',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        Lus
                    </button>
                    <button
                        onClick={() => setFilter('ARCHIVED')}
                        style={{
                            padding: 'var(--spacing-sm) var(--spacing-md)',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: filter === 'ARCHIVED' ? 'var(--primary)' : '#e5e7eb',
                            color: filter === 'ARCHIVED' ? 'white' : '#374151',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        Archivés
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: selectedMessage ? '1fr 1fr' : '1fr', gap: 'var(--spacing-lg)' }}>
                {/* Messages List */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-md)',
                    border: '1px solid var(--border)',
                    overflow: 'hidden'
                }}>
                    {loading ? (
                        <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>Chargement...</div>
                    ) : messages.length === 0 ? (
                        <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            Aucun message
                        </div>
                    ) : (
                        <div>
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    onClick={() => {
                                        setSelectedMessage(msg);
                                        if (msg.status === 'NEW') {
                                            updateStatus(msg.id, 'READ');
                                        }
                                    }}
                                    style={{
                                        padding: 'var(--spacing-md)',
                                        borderBottom: '1px solid var(--border)',
                                        cursor: 'pointer',
                                        backgroundColor: selectedMessage?.id === msg.id ? '#f3f4f6' : 'white',
                                        transition: 'background-color 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (selectedMessage?.id !== msg.id) {
                                            e.currentTarget.style.backgroundColor = '#f9fafb';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (selectedMessage?.id !== msg.id) {
                                            e.currentTarget.style.backgroundColor = 'white';
                                        }
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 'var(--spacing-xs)' }}>
                                        <div style={{ fontWeight: msg.status === 'NEW' ? '700' : '600' }}>
                                            {msg.name}
                                        </div>
                                        {getStatusBadge(msg.status)}
                                    </div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                                        {msg.email}
                                    </div>
                                    <div style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: 'var(--spacing-xs)' }}>
                                        {msg.subject}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                        {new Date(msg.createdAt).toLocaleDateString('fr-FR', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Message Detail */}
                {selectedMessage && (
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: 'var(--radius-lg)',
                        boxShadow: 'var(--shadow-md)',
                        border: '1px solid var(--border)',
                        padding: 'var(--spacing-lg)',
                        maxHeight: '80vh',
                        overflowY: 'auto'
                    }}>
                        <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: 'var(--spacing-sm)' }}>
                                {selectedMessage.subject}
                            </h2>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                De: <strong>{selectedMessage.name}</strong> ({selectedMessage.email})
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 'var(--spacing-xs)' }}>
                                {new Date(selectedMessage.createdAt).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </div>
                        </div>

                        <div style={{ marginBottom: 'var(--spacing-xl)', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                            {selectedMessage.message}
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
                            {selectedMessage.status !== 'READ' && (
                                <button
                                    onClick={() => updateStatus(selectedMessage.id, 'READ')}
                                    style={{
                                        padding: 'var(--spacing-sm) var(--spacing-lg)',
                                        backgroundColor: '#3b82f6',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: 'var(--radius-md)',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Marquer comme lu
                                </button>
                            )}
                            {selectedMessage.status !== 'ARCHIVED' && (
                                <button
                                    onClick={() => updateStatus(selectedMessage.id, 'ARCHIVED')}
                                    style={{
                                        padding: 'var(--spacing-sm) var(--spacing-lg)',
                                        backgroundColor: '#6b7280',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: 'var(--radius-md)',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Archiver
                                </button>
                            )}
                            <button
                                onClick={() => deleteMessage(selectedMessage.id)}
                                style={{
                                    padding: 'var(--spacing-sm) var(--spacing-lg)',
                                    backgroundColor: '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 'var(--radius-md)',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Supprimer
                            </button>
                            <a
                                href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                                style={{
                                    padding: 'var(--spacing-sm) var(--spacing-lg)',
                                    backgroundColor: 'var(--primary)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 'var(--radius-md)',
                                    fontWeight: '600',
                                    textDecoration: 'none',
                                    display: 'inline-block'
                                }}
                            >
                                Répondre par email
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
