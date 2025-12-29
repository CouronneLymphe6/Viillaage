'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FeedItemType } from '@/lib/feedService';
import styles from './Feed.module.css';

interface Comment {
    id: string;
    content: string;
    createdAt: Date;
    user: {
        id: string;
        name: string;
        image?: string | null;
        role: string;
    };
}

interface FeedCommentsProps {
    feedType: FeedItemType;
    feedItemId: string;
    onClose: () => void;
}

export default function FeedComments({ feedType, feedItemId, onClose }: FeedCommentsProps) {
    const { data: session } = useSession();
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');

    const isAdmin = session?.user?.role === 'ADMIN';

    useEffect(() => {
        fetchComments();
    }, [feedType, feedItemId]);

    const fetchComments = async () => {
        try {
            const params = new URLSearchParams({ feedType, feedItemId });
            const response = await fetch(`/api/feed/comments?${params}`);

            if (!response.ok) throw new Error('Failed to fetch comments');

            const data = await response.json();
            setComments(data.comments);
        } catch (error) {
            console.error('Error fetching comments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newComment.trim() || submitting) return;

        setSubmitting(true);

        try {
            const response = await fetch('/api/feed/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    feedType,
                    feedItemId,
                    content: newComment.trim(),
                }),
            });

            if (!response.ok) throw new Error('Failed to create comment');

            const data = await response.json();
            setComments([...comments, data.comment]);
            setNewComment('');
        } catch (error) {
            console.error('Error creating comment:', error);
            alert('Erreur lors de l\'ajout du commentaire');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = async (commentId: string) => {
        if (!editContent.trim()) return;

        try {
            const response = await fetch('/api/feed/comments', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    feedType,
                    commentId,
                    content: editContent.trim(),
                }),
            });

            if (!response.ok) throw new Error('Failed to update comment');

            const data = await response.json();
            setComments(comments.map(c => c.id === commentId ? data.comment : c));
            setEditingId(null);
            setEditContent('');
        } catch (error) {
            console.error('Error updating comment:', error);
            alert('Erreur lors de la modification du commentaire');
        }
    };

    const handleDelete = async (commentId: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) return;

        try {
            const params = new URLSearchParams({ feedType, commentId });
            const response = await fetch(`/api/feed/comments?${params}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete comment');

            setComments(comments.filter(c => c.id !== commentId));
        } catch (error) {
            console.error('Error deleting comment:', error);
            alert('Erreur lors de la suppression du commentaire');
        }
    };

    const formatDate = (date: Date) => {
        const now = new Date();
        const diffMs = now.getTime() - new Date(date).getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);

        if (diffMins < 1) return 'À l\'instant';
        if (diffMins < 60) return `Il y a ${diffMins} min`;
        if (diffHours < 24) return `Il y a ${diffHours}h`;

        return new Date(date).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
        });
    };

    return (
        <div className={styles.commentsSection}>
            <div className={styles.commentsHeader}>
                <h4>Commentaires ({comments.length})</h4>
            </div>

            {loading ? (
                <div className={styles.commentsLoading}>Chargement...</div>
            ) : (
                <>
                    {/* Comments List */}
                    <div className={styles.commentsList}>
                        {comments.length === 0 ? (
                            <p className={styles.noComments}>Aucun commentaire pour le moment.</p>
                        ) : (
                            comments.map((comment) => (
                                <div key={comment.id} className={styles.comment}>
                                    <div className={styles.commentAvatar}>
                                        {comment.user.image ? (
                                            <img src={comment.user.image} alt={comment.user.name} />
                                        ) : (
                                            <div className={styles.avatarPlaceholder}>
                                                {comment.user.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>

                                    <div className={styles.commentContent}>
                                        <div className={styles.commentHeader}>
                                            <span className={styles.commentAuthor}>
                                                {comment.user.name}
                                                {comment.user.role === 'ADMIN' && (
                                                    <span className={styles.adminBadge}>👑</span>
                                                )}
                                            </span>
                                            <span className={styles.commentDate}>
                                                {formatDate(comment.createdAt)}
                                            </span>
                                        </div>

                                        {editingId === comment.id ? (
                                            <div className={styles.editForm}>
                                                <textarea
                                                    value={editContent}
                                                    onChange={(e) => setEditContent(e.target.value)}
                                                    className={styles.editTextarea}
                                                />
                                                <div className={styles.editActions}>
                                                    <button
                                                        onClick={() => handleEdit(comment.id)}
                                                        className={styles.saveButton}
                                                    >
                                                        Enregistrer
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setEditingId(null);
                                                            setEditContent('');
                                                        }}
                                                        className={styles.cancelButton}
                                                    >
                                                        Annuler
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <p className={styles.commentText}>{comment.content}</p>

                                                {isAdmin && (
                                                    <div className={styles.commentActions}>
                                                        <button
                                                            onClick={() => {
                                                                setEditingId(comment.id);
                                                                setEditContent(comment.content);
                                                            }}
                                                            className={styles.editButton}
                                                        >
                                                            ✏️ Modifier
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(comment.id)}
                                                            className={styles.deleteButton}
                                                        >
                                                            🗑️ Supprimer
                                                        </button>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Add Comment Form */}
                    <form onSubmit={handleSubmit} className={styles.commentForm}>
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Ajouter un commentaire..."
                            className={styles.commentInput}
                            rows={3}
                            disabled={submitting}
                        />
                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={!newComment.trim() || submitting}
                        >
                            {submitting ? 'Envoi...' : 'Commenter'}
                        </button>
                    </form>
                </>
            )}
        </div>
    );
}
