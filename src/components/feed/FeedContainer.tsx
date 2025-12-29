'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import FeedFilters from './FeedFilters';
import FeedItem from './FeedItem';
import { UnifiedFeedItem, FeedItemType } from '@/lib/feedService';
import styles from './Feed.module.css';

export default function FeedContainer() {
    const { data: session } = useSession();
    const [feedItems, setFeedItems] = useState<UnifiedFeedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilters, setActiveFilters] = useState<FeedItemType[]>([]);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const fetchFeed = useCallback(async (reset = false) => {
        try {
            const currentOffset = reset ? 0 : offset;
            setLoadingMore(!reset);

            const params = new URLSearchParams({
                limit: '20',
                offset: currentOffset.toString(),
            });

            if (activeFilters.length > 0) {
                params.set('types', activeFilters.join(','));
            }

            const response = await fetch(`/api/feed?${params}`);

            if (!response.ok) throw new Error('Failed to fetch feed');

            const data = await response.json();

            if (reset) {
                setFeedItems(data.items);
                setOffset(data.offset);
            } else {
                setFeedItems(prev => [...prev, ...data.items]);
                setOffset(data.offset);
            }

            setHasMore(data.hasMore);

        } catch (error) {
            console.error('Error fetching feed:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [activeFilters, offset]);

    // Initial load
    useEffect(() => {
        if (session?.user) {
            fetchFeed(true);
        }
    }, [session, activeFilters]);

    const handleFilterChange = (filters: FeedItemType[]) => {
        setActiveFilters(filters);
        setOffset(0);
        setLoading(true);
    };

    const loadMore = () => {
        if (!loadingMore && hasMore) {
            fetchFeed(false);
        }
    };

    if (!session?.user) {
        return (
            <div className={styles.emptyState}>
                <h2>Bienvenue sur Viillaage !</h2>
                <p>Connectez-vous pour voir le fil d'actualité de votre village.</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Fil d'Actualité</h1>
                <p className={styles.subtitle}>
                    Toutes les actualités de votre village en un seul endroit
                </p>
            </div>

            <FeedFilters
                activeFilters={activeFilters}
                onChange={handleFilterChange}
            />

            {loading ? (
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <p>Chargement du fil...</p>
                </div>
            ) : feedItems.length === 0 ? (
                <div className={styles.emptyState}>
                    <p>Aucune actualité pour le moment.</p>
                    <p className={styles.emptyHint}>
                        Soyez le premier à partager quelque chose !
                    </p>
                </div>
            ) : (
                <>
                    <div className={styles.feedList}>
                        {feedItems.map((item) => (
                            <FeedItem key={`${item.type}-${item.id}`} item={item} />
                        ))}
                    </div>

                    {hasMore && (
                        <div className={styles.loadMoreContainer}>
                            <button
                                className={styles.loadMoreButton}
                                onClick={loadMore}
                                disabled={loadingMore}
                            >
                                {loadingMore ? 'Chargement...' : 'Charger plus'}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
