'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Plus, Loader2 } from 'lucide-react';
import FeedFilters, { FeedCategory } from '@/components/feed/FeedFilters';
import FeedItem from '@/components/feed/FeedItem';
import { FeedItem as FeedItemType } from '@/lib/feed/types';
import styles from './Feed.module.css';

export default function FeedPage() {
    const { data: session } = useSession();
    const [activeCategory, setActiveCategory] = useState<FeedCategory>('ALL');
    const [feedItems, setFeedItems] = useState<FeedItemType[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [showNewPostModal, setShowNewPostModal] = useState(false);

    // Charger le feed
    const loadFeed = async (pageNum: number = 1, category: FeedCategory = 'ALL') => {
        try {
            setLoading(true);
            const response = await fetch(`/api/feed?page=${pageNum}&limit=20&category=${category}`);
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
        loadFeed(1, activeCategory);
        setPage(1);
    }, [activeCategory]);

    const handleCategoryChange = (category: FeedCategory) => {
        setActiveCategory(category);
    };

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
        loadFeed(nextPage, activeCategory);
    };

    return (
        <div className={styles.feedPage}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <h1 className={styles.title}>📰 Fil d'actualité</h1>
                    <p className={styles.subtitle}>Toute l'actualité de votre village</p>
                </div>
                <button
                    className={styles.newPostBtn}
                    onClick={() => setShowNewPostModal(true)}
                >
                    <Plus size={20} />
                    <span>Nouveau post</span>
                </button>
            </div>

            {/* Filters */}
            <FeedFilters
                activeCategory={activeCategory}
                onCategoryChange={handleCategoryChange}
            />

            {/* Feed Content */}
            <div className={styles.feedContainer}>
                {loading && page === 1 ? (
                    <div className={styles.loadingContainer}>
                        <Loader2 className={styles.spinner} size={48} />
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
                                    onComment={handleComment}
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

            {/* Modal Nouveau Post - À implémenter */}
            {showNewPostModal && (
                <div className={styles.modalOverlay} onClick={() => setShowNewPostModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h2>Nouveau post</h2>
                        <p>Fonctionnalité à venir...</p>
                        <button onClick={() => setShowNewPostModal(false)}>Fermer</button>
                    </div>
                </div>
            )}
        </div>
    );
}
