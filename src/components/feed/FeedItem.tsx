'use client';

import { useState } from 'react';
import { UnifiedFeedItem } from '@/lib/feedService';
import FeedComments from './FeedComments';
import styles from './Feed.module.css';

const CATEGORY_CONFIG = {
    ALERT: { label: 'Alerte & Sécurité', icon: '🚨', color: '#EF4444' },
    PRO_POST: { label: 'Actu des Pros', icon: '💼', color: '#8B5CF6' },
    ASSO_POST: { label: 'Actu des Assos', icon: '🎭', color: '#EC4899' },
    EVENT: { label: 'Agenda', icon: '📅', color: '#3B82F6' },
    OFFICIAL: { label: 'Panneau Officiel', icon: '📢', color: '#10B981' },
    LISTING: { label: 'Marché', icon: '🛒', color: '#F59E0B' },
};

interface FeedItemProps {
    item: UnifiedFeedItem;
}

export default function FeedItem({ item }: FeedItemProps) {
    const [showComments, setShowComments] = useState(false);
    const config = CATEGORY_CONFIG[item.type];

    const formatDate = (date: Date) => {
        const now = new Date();
        const diffMs = now.getTime() - new Date(date).getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'À l\'instant';
        if (diffMins < 60) return `Il y a ${diffMins} min`;
        if (diffHours < 24) return `Il y a ${diffHours}h`;
        if (diffDays < 7) return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;

        return new Date(date).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: new Date(date).getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
        });
    };

    const getAuthorName = () => {
        if (item.author.businessName) return item.author.businessName;
        if (item.author.associationName) return item.author.associationName;
        return item.author.name;
    };

    const getRoleBadge = () => {
        if (item.author.role === 'ADMIN') return '👑 Admin';
        if (item.author.role === 'PRO') return '💼 Pro';
        return null;
    };

    return (
        <div className={styles.feedItem} style={{ borderLeftColor: config.color }}>
            {/* Category Badge */}
            <div className={styles.categoryBadge} style={{ backgroundColor: `${config.color}15`, color: config.color }}>
                <span>{config.icon}</span>
                <span>{config.label}</span>
            </div>

            {/* Author Info */}
            <div className={styles.itemHeader}>
                <div className={styles.avatar}>
                    {item.author.image ? (
                        <img src={item.author.image} alt={getAuthorName()} />
                    ) : (
                        <div className={styles.avatarPlaceholder}>
                            {getAuthorName().charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>

                <div className={styles.authorInfo}>
                    <div className={styles.authorName}>
                        {getAuthorName()}
                        {getRoleBadge() && (
                            <span className={styles.roleBadge}>{getRoleBadge()}</span>
                        )}
                    </div>
                    <div className={styles.timestamp}>{formatDate(item.createdAt)}</div>
                </div>
            </div>

            {/* Content */}
            <div className={styles.itemContent}>
                {item.title && item.title !== getAuthorName() && (
                    <h3 className={styles.itemTitle}>{item.title}</h3>
                )}
                <p className={styles.itemText}>{item.content}</p>

                {/* Media */}
                {item.mediaUrl && (
                    <div className={styles.itemMedia}>
                        {item.mediaType === 'IMAGE' ? (
                            <img src={item.mediaUrl} alt={item.title} />
                        ) : item.mediaType === 'PDF' ? (
                            <a href={item.mediaUrl} target="_blank" rel="noopener noreferrer" className={styles.pdfLink}>
                                📄 Voir le document PDF
                            </a>
                        ) : null}
                    </div>
                )}

                {/* Event Metadata */}
                {item.type === 'EVENT' && item.metadata?.eventDate && (
                    <div className={styles.eventDate}>
                        📅 {new Date(item.metadata.eventDate).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </div>
                )}

                {/* Listing Metadata */}
                {item.type === 'LISTING' && item.metadata?.price && (
                    <div className={styles.listingPrice}>
                        💰 {item.metadata.price}€
                    </div>
                )}
            </div>

            {/* Engagement Stats */}
            <div className={styles.itemFooter}>
                <div className={styles.stats}>
                    {item.likeCount !== undefined && (
                        <span className={styles.stat}>
                            ❤️ {item.likeCount}
                        </span>
                    )}
                    {item.participantCount !== undefined && (
                        <span className={styles.stat}>
                            ✓ {item.participantCount} participant{item.participantCount > 1 ? 's' : ''}
                        </span>
                    )}
                    <button
                        className={styles.commentButton}
                        onClick={() => setShowComments(!showComments)}
                    >
                        💬 {item.commentCount} commentaire{item.commentCount > 1 ? 's' : ''}
                    </button>
                </div>
            </div>

            {/* Comments Section */}
            {showComments && (
                <FeedComments
                    feedType={item.type}
                    feedItemId={item.id}
                    onClose={() => setShowComments(false)}
                />
            )}
        </div>
    );
}
