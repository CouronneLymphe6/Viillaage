'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Heart, MessageCircle, Users, MapPin, FileText, Trash } from 'lucide-react';
import styles from './FeedItem.module.css';
import { useSession } from 'next-auth/react';
import { FeedItem as FeedItemType } from '@/lib/feed/types';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from '@/components/Toast';

interface FeedItemProps {
    item: FeedItemType;
    onLike: (itemId: string, itemType: string) => void;
    onComment: (itemId: string, itemType: string) => void;
    onDelete: (itemId: string, itemType: string) => void;
}

// Mapping des catégories vers les couleurs (bordures)
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

// Mapping des catégories vers les labels avec emojis
const categoryLabels: Record<string, { label: string; emoji: string }> = {
    ALERT: { label: 'Alerte & Sécurité', emoji: '🚨' },
    PRO_POST: { label: 'Actu des Pros', emoji: '💼' },
    ASSOCIATION_POST: { label: 'Actu des Assos', emoji: '🤝' },
    EVENT: { label: 'Agenda', emoji: '📅' },
    LISTING: { label: 'Marché', emoji: '🛒' },
    OFFICIAL: { label: 'Panneau Officiel', emoji: '📢' },
    FEED_POST: { label: 'Général', emoji: '💬' },
    ASSOCIATION_EVENT: { label: 'Agenda', emoji: '📅' },
};

export default function FeedItem({ item, onLike, onComment, onDelete }: FeedItemProps) {
    const { data: session } = useSession();
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState<any[]>([]);
    const [loadingComments, setLoadingComments] = useState(false);

    // Optimistic UI for likes
    const [isLiked, setIsLiked] = useState(item.metrics?.isLiked || false);
    const [likeCount, setLikeCount] = useState(item.metrics?.likes || 0);

    const borderColor = categoryColors[item.type] || '#95a5a6';
    const categoryInfo = categoryLabels[item.type] || { label: 'Post', emoji: '📝' };

    const timeAgo = formatDistanceToNow(new Date(item.createdAt), {
        addSuffix: true,
        locale: fr,
    });

    // Optimistic like toggle
    const handleLike = async () => {
        // Optimistic update
        const wasLiked = isLiked;
        const prevCount = likeCount;
        setIsLiked(!wasLiked);
        setLikeCount(wasLiked ? prevCount - 1 : prevCount + 1);

        try {
            const res = await fetch('/api/feed/like', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: item.originalId, type: item.type })
            });

            if (!res.ok) {
                // Rollback on error
                setIsLiked(wasLiked);
                setLikeCount(prevCount);
                toast('Erreur lors du like', 'error');
            } else {
                const data = await res.json();
                // Update with server response
                setIsLiked(data.liked);
                setLikeCount(data.count);
            }
        } catch (error) {
            // Rollback on error
            setIsLiked(wasLiked);
            setLikeCount(prevCount);
            toast('Erreur réseau', 'error');
        }
    };

    const handleCommentClick = async () => {
        const newShowState = !showComments;
        setShowComments(newShowState);

        // Load comments when opening
        if (newShowState && comments.length === 0 && !loadingComments) {
            await fetchComments();
        }
    };

    const fetchComments = async () => {
        setLoadingComments(true);
        try {
            const res = await fetch(`/api/feed/comment?id=${item.originalId}&type=${item.type}`);
            if (res.ok) {
                const data = await res.json();
                setComments(data);
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
        } finally {
            setLoadingComments(false);
        }
    };

    const handleSendComment = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const input = form.elements.namedItem('comment') as HTMLInputElement;
        const content = input.value.trim();

        if (!content) return;

        try {
            const res = await fetch('/api/feed/comment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: item.originalId,
                    type: item.type,
                    content
                })
            });

            if (res.ok) {
                const newComment = await res.json();
                input.value = '';
                toast('Commentaire envoyé !', 'success');
                // Add comment to local list
                setComments([...comments, newComment]);
                // Refresh comments to get full list
                await fetchComments();
            } else {
                toast('Erreur lors de l\'envoi', 'error');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = () => {
        onDelete(item.originalId, item.type);
    };

    // Check permissions
    const isAuthor = session?.user?.id === item.author.id && item.author.type === 'USER';
    const isAdmin = session?.user?.role === 'ADMIN';
    const canDelete = isAdmin || isAuthor;

    // Déterminer si c'est un événement
    const isEvent = item.type === 'EVENT' || item.type === 'ASSOCIATION_EVENT';
    const eventDate = item.metadata?.eventDate ? new Date(item.metadata.eventDate) : null;

    return (
        <article className={styles.feedItem} style={{ borderLeftColor: borderColor }}>
            {/* Badge de catégorie en haut */}
            {item.type !== 'FEED_POST' && (
                <div className={styles.categoryBadge} style={{ backgroundColor: borderColor }}>
                    <span>{categoryInfo.emoji}</span>
                    <span>{categoryInfo.label}</span>
                </div>
            )}

            {/* Header avec avatar et infos auteur */}
            <div className={styles.header}>
                <div className={styles.avatar}>
                    {item.author.image ? (
                        <Image
                            src={item.author.image}
                            alt={item.author.name}
                            width={52}
                            height={52}
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
                {canDelete && (
                    <button
                        className={styles.deleteBtn}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDelete();
                        }}
                        title="Supprimer"
                    >
                        <Trash size={16} />
                    </button>
                )}
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
            </div>

            {/* Media */}
            {item.content.mediaUrl && item.content.mediaType === 'PHOTO' && (
                <div
                    className={styles.mediaContainer}
                    onClick={() => item.content.mediaUrl && window.open(item.content.mediaUrl, '_blank')}
                    style={{ cursor: 'pointer', position: 'relative' }}
                >
                    <Image
                        src={item.content.mediaUrl}
                        alt="Post media"
                        width={600}
                        height={400}
                        className={styles.media}
                        loading="lazy"
                    />
                    <div
                        style={{
                            position: 'absolute',
                            bottom: '8px',
                            right: '8px',
                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                            color: 'white',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            pointerEvents: 'none',
                        }}
                    >
                        🔍 Cliquer pour agrandir
                    </div>
                </div>
            )}

            {/* Metrics - Style Viillaage avec cœurs rouges */}
            <div className={styles.metrics}>
                <button
                    className={`${styles.metricBtn} ${isLiked ? styles.liked : ''}`}
                    onClick={handleLike}
                >
                    <Heart size={22} fill={isLiked ? '#e74c3c' : 'none'} />
                    <span>{likeCount}</span>
                </button>

                {/* Show Comment Button for ALL types */}
                <button className={styles.metricBtn} onClick={handleCommentClick}>
                    <MessageCircle size={22} />
                    <span>{item.metrics?.comments || 0} commentaire{(item.metrics?.comments || 0) > 1 ? 's' : ''}</span>
                </button>

                {/* For events, show participants count with icon */}
                {isEvent && item.metrics?.likes !== undefined && item.metrics.likes > 0 && (
                    <div className={styles.metricBtn} style={{ cursor: 'default' }}>
                        <Users size={20} />
                        <span>{item.metrics.likes} participant{item.metrics.likes > 1 ? 's' : ''}</span>
                    </div>
                )}
            </div>

            {/* Section Commentaires */}
            {showComments && (
                <div className={styles.commentsSection} style={{ padding: '16px', borderTop: '1px solid #f0f0f0' }}>
                    {/* Comment List */}
                    {loadingComments ? (
                        <p style={{ textAlign: 'center', color: '#999', padding: '12px' }}>Chargement...</p>
                    ) : comments.length > 0 ? (
                        <div style={{ marginBottom: '16px', maxHeight: '300px', overflowY: 'auto' }}>
                            {comments.map((comment: any) => (
                                <div key={comment.id} style={{ display: 'flex', gap: '12px', marginBottom: '12px', padding: '8px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: '600', flexShrink: 0 }}>
                                        {comment.user?.image ? (
                                            <Image src={comment.user.image} alt={comment.user.name} width={32} height={32} style={{ borderRadius: '50%' }} />
                                        ) : (
                                            comment.user?.name?.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '4px' }}>
                                            {comment.user?.name || 'Utilisateur'}
                                        </div>
                                        <div style={{ fontSize: '0.9rem', color: '#333' }}>
                                            {comment.content}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '4px' }}>
                                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: fr })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : null}

                    {/* Comment Form */}
                    <form
                        onSubmit={handleSendComment}
                        style={{ display: 'flex', gap: '8px' }}
                    >
                        <input
                            type="text"
                            name="comment"
                            placeholder="Écrire un commentaire..."
                            style={{
                                flex: 1,
                                padding: '8px 12px',
                                borderRadius: '20px',
                                border: '1px solid #ddd',
                                fontSize: '0.95rem'
                            }}
                            autoComplete="off"
                        />
                        <button
                            type="submit"
                            style={{
                                background: 'var(--primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '20px',
                                padding: '8px 16px',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            Envoyer
                        </button>
                    </form>
                </div>
            )}
        </article>
    );
}
