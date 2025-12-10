'use client';

import { useEffect, useState } from 'react';

interface Article {
    title: string;
    source: string;
    publishedAt: string;
    snippet: string;
    url: string;
}

interface PressReviewData {
    summary: string;
    articles: Article[];
    date: string;
    cached: boolean;
}

export default function PressReviewCard() {
    const [data, setData] = useState<PressReviewData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showArticles, setShowArticles] = useState(false);

    useEffect(() => {
        fetchReview();
    }, []);

    const fetchReview = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/ai/press-review');

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));

                // Si c'est une erreur de configuration API, afficher un message spécifique
                if (response.status === 500 && errorData.details?.includes('GEMINI')) {
                    throw new Error('⚙️ Configuration API IA en cours...');
                }

                throw new Error('Erreur lors du chargement de la revue de presse');
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
                    📰 Revue de Presse
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
                    📰 Revue de Presse
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    ⚠️ {error}
                </p>
                <button
                    onClick={fetchReview}
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
                <h3 style={{ color: 'var(--primary)' }}>📰 Revue de Presse</h3>
                {data.cached && (
                    <span style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                        fontStyle: 'italic',
                    }}>
                        Actualités d'hier
                    </span>
                )}
            </div>

            {/* Résumé IA */}
            <div style={{
                fontSize: '0.95rem',
                lineHeight: '1.6',
                marginBottom: 'var(--spacing-sm)',
                color: 'var(--text-primary)',
                whiteSpace: 'pre-line',
            }}>
                {data.summary}
            </div>

            {/* Bouton pour afficher les articles sources */}
            {data.articles.length > 0 && (
                <>
                    <button
                        onClick={() => setShowArticles(!showArticles)}
                        style={{
                            marginTop: 'var(--spacing-sm)',
                            padding: '6px 12px',
                            backgroundColor: 'transparent',
                            color: 'var(--primary)',
                            border: '1px solid var(--primary)',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            width: '100%',
                        }}
                    >
                        {showArticles ? '▲ Masquer les sources' : `▼ Voir les sources (${data.articles.length})`}
                    </button>

                    {/* Liste des articles */}
                    {showArticles && (
                        <div style={{
                            marginTop: 'var(--spacing-sm)',
                            paddingTop: 'var(--spacing-sm)',
                            borderTop: '1px solid var(--border)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'var(--spacing-sm)',
                        }}>
                            {data.articles.map((article, index) => (
                                <a
                                    key={index}
                                    href={article.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        textDecoration: 'none',
                                        color: 'inherit',
                                        padding: 'var(--spacing-xs)',
                                        borderRadius: 'var(--radius-sm)',
                                        border: '1px solid var(--border)',
                                        transition: 'all 0.2s',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = 'var(--background)';
                                        e.currentTarget.style.borderColor = 'var(--primary)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.borderColor = 'var(--border)';
                                    }}
                                >
                                    <div style={{
                                        fontWeight: '600',
                                        fontSize: '0.9rem',
                                        marginBottom: '4px',
                                        color: 'var(--text-primary)',
                                    }}>
                                        {article.title}
                                    </div>
                                    <div style={{
                                        fontSize: '0.75rem',
                                        color: 'var(--text-secondary)',
                                        display: 'flex',
                                        gap: '8px',
                                    }}>
                                        <span>📰 {article.source}</span>
                                        <span>•</span>
                                        <span>{article.publishedAt}</span>
                                    </div>
                                </a>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
