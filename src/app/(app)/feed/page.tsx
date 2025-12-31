'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Plus, Loader2 } from 'lucide-react';
import FeedItem from '@/components/feed/FeedItem';
import NewPostSelector from '@/components/feed/NewPostSelector';
import FeedWidgets from '@/components/feed/FeedWidgets';
import { FeedItem as FeedItemType } from '@/lib/feed/types';
import styles from './Feed.module.css';

export default function FeedPage() {
    const { data: session } = useSession();
    const [feedItems, setFeedItems] = useState<FeedItemType[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [showNewPostModal, setShowNewPostModal] = useState(false);

    // Charger le feed
    const loadFeed = async (pageNum: number = 1) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/feed?page=${pageNum}&limit=20`);
            if (response.ok) {
                const data = await response.json();
                if (pageNum === 1) {
                    setFeedItems(data.items);
                } else {
                    setFeedItems(prev => [...prev, ...data.items]);
                }
                setHasMore(data.items.length === 20);
            }
        } catch (error) {
            console.error('Error loading feed:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFeed(1);
        setPage(1);
    }, []);

    const handleLike = async (itemId: string, itemType: string) => {
        try {
            const response = await fetch('/api/feed/like', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: itemId, type: itemType }),
            });

            if (response.ok) {
                const { liked, count } = await response.json();
                // Mettre à jour l'état local
                setFeedItems(prev =>
                    prev.map(item =>
                        item.originalId === itemId
                            ? {
                                ...item,
                                metrics: {
                                    ...item.metrics,
                                    likes: count,
                                    isLiked: liked,
                                },
                            }
                            : item
                    )
                );
            }
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const handleComment = async (itemId: string, itemType: string) => {
        // Pour l'instant, juste logger - on peut ajouter un modal de commentaires plus tard
        console.log('Comment on:', itemId, itemType);
    };


    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        loadFeed(nextPage);
    };

    const handleDelete = async (itemId: string, itemType: string) => {
        if (!confirm('Voulez-vous vraiment supprimer cet élément ?')) return;

        try {
            const response = await fetch(`/api/feed?id=${itemId}&type=${itemType}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                // Remove item from list locally
                setFeedItems(prev => prev.filter(item => item.originalId !== itemId));
                // Optional: Reload to be sure
                // loadFeed(1);
            } else {
                alert("Erreur lors de la suppression");
            }
        } catch (error) {
            console.error('Error deleting:', error);
            alert("Erreur lors de la suppression");
        }
    };

    return (
        <div className={styles.feedPage}>
            {/* Header simple avec salutation */}
            <header style={{ marginBottom: '20px', padding: '0 4px' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>
                    Bonjour {session?.user?.name?.split(' ')[0] || 'Voisin'} ! 👋
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                    Voici ce qui se passe à Beaupuy aujourd'hui.
                </p>
            </header>

            {/* Widgets (Gazette, Météo, Stats) */}
            <FeedWidgets />

            {/* Feed Content */}
            <div className={styles.feedContainer}>
                {loading && page === 1 ? (
                    <div className={styles.loader}>
                        <Loader2 className={styles.spinner} size={40} />
                        <p>Chargement du fil...</p>
                    </div>
                ) : feedItems.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>📭</div>
                        <h3>Aucune publication</h3>
                        <p>Soyez le premier à publier dans cette catégorie !</p>
                        <button
                            className={styles.emptyBtn}
                            onClick={() => setShowNewPostModal(true)}
                        >
                            Créer un post
                        </button>
                    </div>
                ) : (
                    <>
                        <div className={styles.feedList}>
                            {feedItems.map((item) => (
                                <FeedItem
                                    key={item.id}
                                    item={item}
                                    onLike={handleLike}
                                    onComment={() => { }} // Géré en interne dans FeedItem maintenant
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>

                        {/* Load More */}
                        {hasMore && !loading && (
                            <div className={styles.loadMoreContainer}>
                                <button className={styles.loadMoreBtn} onClick={handleLoadMore}>
                                    Charger plus
                                </button>
                            </div>
                        )}

                        {loading && page > 1 && (
                            <div className={styles.loadingMore}>
                                <Loader2 className={styles.spinner} size={24} />
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Floating Action Button pour créer un post */}
            <button
                onClick={() => setShowNewPostModal(true)}
                className="fab-button"
                style={{
                    position: 'fixed',
                    bottom: '24px',
                    right: '24px',
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0, 191, 165, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 100,
                    transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                title="Nouveau post"
            >
                <Plus size={32} />
            </button>

            {/* Responsive CSS for FAB */}
            <style jsx>{`
                @media (max-width: 768px) {
                    .fab-button {
                        bottom: 84px !important;
                    }
                }
            `}</style>

            {/* Modal Nouveau Post */}
            {showNewPostModal && (
                <NewPostSelector
                    onClose={() => setShowNewPostModal(false)}
                    onPostCreated={() => {
                        loadFeed(1);
                        setPage(1);
                    }}
                />
            )}
        </div>
    );
}
