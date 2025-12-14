'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface DailySummaryData {
    summary: string;
    stats: {
        totalMessages: number;
        newAlerts: number;
        newEvents: number;
        proPosts: number;
        newListings: number;
    };
    date: string;
    cached: boolean;
}

export default function DailySummaryCard() {
    const [data, setData] = useState<DailySummaryData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchSummary();
    }, []);

    const fetchSummary = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/ai/daily-summary');

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));

                // Si c'est une erreur de configuration API, afficher un message spécifique
                if (response.status === 500 && errorData.details?.includes('GEMINI')) {
                    throw new Error('⚙️ Configuration API IA en cours...');
                }

                throw new Error('Erreur lors du chargement du résumé');
            }

            const result = await response.json();
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur inconnue');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{
                backgroundColor: 'var(--secondary)',
                padding: 'var(--spacing-md)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-sm)',
            }}>
                <h3 style={{ color: 'var(--primary)', marginBottom: 'var(--spacing-sm)' }}>
                    🗣️ Les Potins de Beaupuy
                </h3>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 'var(--spacing-lg)',
                    color: 'var(--text-secondary)',
                }}>
                    <div className="spinner" style={{
                        border: '3px solid var(--border)',
                        borderTop: '3px solid var(--primary)',
                        borderRadius: '50%',
                        width: '30px',
                        height: '30px',
                        animation: 'spin 1s linear infinite',
                    }}></div>
                    <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                backgroundColor: 'var(--secondary)',
                padding: 'var(--spacing-md)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-sm)',
            }}>
                <h3 style={{ color: 'var(--primary)', marginBottom: 'var(--spacing-sm)' }}>
                    🗣️ Les Potins de Beaupuy
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    ⚠️ {error}
                </p>
                <button
                    onClick={fetchSummary}
                    style={{
                        marginTop: 'var(--spacing-sm)',
                        padding: '8px 16px',
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                    }}
                >
                    Réessayer
                </button>
            </div>
        );
    }

    if (!data) {
        return null;
    }

    return (
        <div style={{
            backgroundColor: 'var(--secondary)',
            padding: 'var(--spacing-md)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-sm)',
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'var(--spacing-sm)'
            }}>
                <h3 style={{ color: 'var(--primary)' }}>📰 La Gazette de Beaupuy</h3>
                {data.cached && (
                    <span style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                        fontStyle: 'italic',
                    }}>
                        Résumé d'hier
                    </span>
                )}
            </div>

            {/* Résumé IA */}
            <div style={{
                fontSize: '0.95rem',
                lineHeight: '1.6',
                color: 'var(--text-primary)',
            }}>
                {(() => {
                    try {
                        // Tenter de parser si c'est du JSON
                        const parsed = JSON.parse(data.summary);
                        return (
                            <>
                                {parsed.title && (
                                    <h4 style={{
                                        margin: '0 0 var(--spacing-sm) 0',
                                        fontSize: '1.1rem',
                                        color: 'var(--text-main)',
                                        fontWeight: '700'
                                    }}>
                                        {parsed.title}
                                    </h4>
                                )}
                                <div style={{ whiteSpace: 'pre-line' }}>{parsed.content}</div>
                            </>
                        );
                    } catch (e) {
                        // Fallback si ce n'est pas du JSON (ancien format ou erreur)
                        return <div style={{ whiteSpace: 'pre-line' }}>{data.summary}</div>;
                    }
                })()}
            </div>

            {/* Stats visuelles */}
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 'var(--spacing-sm)',
                paddingTop: 'var(--spacing-sm)',
                borderTop: '1px solid var(--border)',
            }}>
                {data.stats.totalMessages > 0 && (
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        💬 {data.stats.totalMessages} messages
                    </span>
                )}
                {data.stats.newAlerts > 0 && (
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        🚨 {data.stats.newAlerts} alertes
                    </span>
                )}
                {data.stats.newEvents > 0 && (
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        📅 {data.stats.newEvents} événements
                    </span>
                )}
                {data.stats.proPosts > 0 && (
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        🏪 {data.stats.proPosts} posts pros
                    </span>
                )}
                {data.stats.newListings > 0 && (
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        🛍️ {data.stats.newListings} annonces
                    </span>
                )}
            </div>
        </div>
    );
}
