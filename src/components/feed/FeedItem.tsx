'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Heart, MessageCircle, Users, MapPin, Calendar, FileText } from 'lucide-react';
import styles from './FeedItem.module.css';
import { FeedItem as FeedItemType } from '@/lib/feed/types';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface FeedItemProps {
    item: FeedItemType;
    onLike: (itemId: string, itemType: string) => void;
    onComment: (itemId: string, itemType: string) => void;
}

// Mapping des catégories vers les couleurs de bordure
const categoryColors: Record<string, string> = {
    ALERT: '#e74c3c',
    PRO_POST: '#9b59b6',
    ASSOCIATION_POST: '#e91e63',
    EVENT: '#3498db',
    LISTING: '#f39c12',
    OFFICIAL: '#00BFA5',
    FEED_POST: '#95a5a6',
    ASSOCIATION_EVENT: '#3498db',
};

// Mapping des catégories vers les labels
const categoryLabels: Record<string, string> = {
    ALERT: 'Alerte & Sécurité',
    PRO_POST: 'Actu des Pros',
    ASSOCIATION_POST: 'Actu des Assos',
    EVENT: 'Agenda',
    LISTING: 'Marché',
    OFFICIAL: 'Panneau Officiel',
    FEED_POST: 'Général',
    ASSOCIATION_EVENT: 'Agenda',
};

export default function FeedItem({ item, onLike, onComment }: FeedItemProps) {
    const [showComments, setShowComments] = useState(false);

    const borderColor = categoryColors[item.type] || '#95a5a6';
    const categoryLabel = categoryLabels[item.type] || 'Post';

    const timeAgo = formatDistanceToNow(new Date(item.createdAt), {
        addSuffix: true,
        locale: fr,
    });

    const handleLike = () => {
        onLike(item.originalId, item.type);
    };

    const handleCommentClick = () => {
        setShowComments(!showComments);
        if (!showComments) {
            onComment(item.originalId, item.type);
        }
    };

    // Déterminer si c'est un événement
    const isEvent = item.type === 'EVENT' || item.type === 'ASSOCIATION_EVENT';
    const eventDate = item.metadata?.eventDate ? new Date(item.metadata.eventDate) : null;

    return (
        <article className={styles.feedItem} style={{ borderLeftColor: borderColor }}>
            {/* Category Badge */}
            <div className={styles.categoryBadge} style={{ backgroundColor: borderColor }}>
                {categoryLabel}
            </div>

            {/* Author Info */}
            <div className={styles.header}>
                <div className={styles.avatar}>
                    {item.author.image ? (
                        <Image
                            src={item.author.image}
                            alt={item.author.name}
                            width={48}
                            height={48}
                            className={styles.avatarImg}
                        />
                    ) : (
                        <div className={styles.avatarPlaceholder}>
                            {item.author.name.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
                <div className={styles.authorInfo}>
                    <div className={styles.authorName}>
                        {item.author.name}
                        {item.author.type === 'USER' && item.author.subline?.includes('Admin') && (
                            <span className={styles.adminBadge}>✓ Admin</span>
                        )}
                    </div>
                    <div className={styles.timestamp}>{timeAgo}</div>
                </div>
            </div>

            {/* Content */}
            <div className={styles.content}>
                {item.content.title && (
                    <h3 className={styles.title}>{item.content.title}</h3>
                )}
                <p className={styles.text}>{item.content.text}</p>

                {/* Event Date Card (pour les événements) */}
                {isEvent && eventDate && (
                    <div className={styles.eventCard}>
                        <div className={styles.eventDate}>
                            <div className={styles.eventDay}>{eventDate.getDate()}</div>
                            <div className={styles.eventMonth}>
                                {eventDate.toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase()}
                            </div>
                            <div className={styles.eventYear}>{eventDate.getFullYear()}</div>
                        </div>
                        <div className={styles.eventDetails}>
                            <div className={styles.eventTitle}>{item.content.title}</div>
                            {item.metadata?.location && (
                                <div className={styles.eventLocation}>
                                    <MapPin size={14} />
                                    {item.metadata.location}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Media */}
                {item.content.mediaUrl && item.content.mediaType === 'PHOTO' && (
                    <div className={styles.mediaContainer}>
                        <Image
                            src={item.content.mediaUrl}
                            alt="Post media"
                            width={600}
                            height={400}
                            className={styles.media}
                            loading="lazy"
                        />
                    </div>
                )}

                {/* PDF Attachment */}
                {item.content.mediaUrl && item.content.mediaUrl.toLowerCase().endsWith('.pdf') && (
                    <a
                        href={item.content.mediaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.pdfLink}
                    >
                        <FileText size={20} />
                        <span>Voir le document PDF</span>
                    </a>
                )}

                {/* Listing Price */}
                {item.type === 'LISTING' && item.metadata?.price && (
                    <div className={styles.price}>
                        {item.metadata.price === 0 ? 'Gratuit' : `${item.metadata.price}€`}
                    </div>
                )}
            </div>

            {/* Metrics */}
            <div className={styles.metrics}>
                <button
                    className={`${styles.metricBtn} ${item.metrics?.isLiked ? styles.liked : ''}`}
                    onClick={handleLike}
                >
                    <Heart size={20} fill={item.metrics?.isLiked ? '#e74c3c' : 'none'} />
                    <span>{item.metrics?.likes || 0}</span>
                </button>

                <button className={styles.metricBtn} onClick={handleCommentClick}>
                    <MessageCircle size={20} />
                    <span>{item.metrics?.comments || 0} commentaire{(item.metrics?.comments || 0) > 1 ? 's' : ''}</span>
                </button>

                {isEvent && item.metrics?.likes !== undefined && (
                    <div className={styles.participants}>
                        <Users size={20} />
                        <span>{item.metrics.likes} participant{item.metrics.likes > 1 ? 's' : ''}</span>
                    </div>
                )}
            </div>
        </article>
    );
}
