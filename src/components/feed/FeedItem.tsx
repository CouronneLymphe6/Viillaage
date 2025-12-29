'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Heart, MessageCircle, Users, MapPin, FileText } from 'lucide-react';
import styles from './FeedItem.module.css';
import { FeedItem as FeedItemType } from '@/lib/feed/types';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface FeedItemProps {
    item: FeedItemType;
    onLike: (itemId: string, itemType: string) => void;
    onComment: (itemId: string, itemType: string) => void;
}

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

    // Nom de l'auteur avec contexte (business ou association)
    const authorDisplayName = item.author.type === 'BUSINESS' && item.author.subline
        ? item.author.name
        : item.author.type === 'ASSOCIATION' && item.author.name
            ? item.author.name
            : item.author.name;

    return (
        <article className={styles.feedItem}>
            {/* Header avec avatar et infos auteur */}
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
                        {authorDisplayName}
                    </div>
                    <div className={styles.timestamp}>
                        {timeAgo}
                        {item.type !== 'FEED_POST' && (
                            <>
                                <span>•</span>
                                <span className={styles.categoryBadge}>
                                    {categoryLabel}
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Contenu */}
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

                {/* Listing Price */}
                {item.type === 'LISTING' && item.metadata?.price !== undefined && (
                    <div className={styles.price}>
                        {item.metadata.price === 0 ? 'Gratuit' : `${item.metadata.price}€`}
                    </div>
                )}
            </div>

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
                <div className={styles.content}>
                    <a
                        href={item.content.mediaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.pdfLink}
                    >
                        <FileText size={20} />
                        <span>Voir le document PDF</span>
                    </a>
                </div>
            )}

            {/* Metrics - Style LinkedIn */}
            <div className={styles.metrics}>
                <button
                    className={`${styles.metricBtn} ${item.metrics?.isLiked ? styles.liked : ''}`}
                    onClick={handleLike}
                >
                    <Heart size={20} fill={item.metrics?.isLiked ? 'currentColor' : 'none'} />
                    <span>{item.metrics?.likes || 0}</span>
                </button>

                <button className={styles.metricBtn} onClick={handleCommentClick}>
                    <MessageCircle size={20} />
                    <span>{item.metrics?.comments || 0}</span>
                </button>

                {isEvent && item.metrics?.likes !== undefined && (
                    <div className={styles.participants}>
                        <Users size={18} />
                        <span>{item.metrics.likes}</span>
                    </div>
                )}
            </div>
        </article>
    );
}
