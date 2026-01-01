'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Heart, MessageCircle, Edit2, Trash2, MoreVertical } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useSession } from 'next-auth/react';
import { toast } from '@/components/Toast';
import styles from './CommentItem.module.css';

interface CommentItemProps {
    comment: any;
    onReply?: (commentId: string, content: string) => Promise<void>;
    onDelete?: (commentId: string) => Promise<void>;
    onUpdate?: (commentId: string, content: string) => Promise<void>;
    depth?: number;
}

export default function CommentItem({
    comment,
    onReply,
    onDelete,
    onUpdate,
    depth = 0
}: CommentItemProps) {
    const { data: session } = useSession();
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);
    const [replyContent, setReplyContent] = useState('');
    const [isLiked, setIsLiked] = useState(comment.isLiked || false);
    const [likeCount, setLikeCount] = useState(comment.likeCount || 0);

    const user = session?.user as any;
    const isAuthor = user?.id === comment.user.id;
    const isAdmin = user?.role === 'ADMIN';
    const canModify = isAuthor || isAdmin;

    const handleLike = async () => {
        if (!user) {
            toast('Connectez-vous pour liker', 'error');
            return;
        }

        const wasLiked = isLiked;
        const prevCount = likeCount;
        setIsLiked(!wasLiked);
        setLikeCount(wasLiked ? prevCount - 1 : prevCount + 1);

        try {
            const res = await fetch(`/api/feed/comment/${comment.id}/like`, {
                method: 'POST'
            });

            if (!res.ok) {
                setIsLiked(wasLiked);
                setLikeCount(prevCount);
                toast('Erreur lors du like', 'error');
            } else {
                const data = await res.json();
                setIsLiked(data.liked);
                setLikeCount(data.count);
            }
        } catch (error) {
            setIsLiked(wasLiked);
            setLikeCount(prevCount);
            toast('Erreur réseau', 'error');
        }
    };

    const handleReplySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyContent.trim()) return;

        try {
            const res = await fetch(`/api/feed/comment/${comment.id}/reply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: replyContent })
            });

            if (res.ok) {
                setReplyContent('');
                setShowReplyForm(false);
                toast('Réponse envoyée !', 'success');
                if (onReply) await onReply(comment.id, replyContent);
            } else {
                toast('Erreur lors de l\'envoi', 'error');
            }
        } catch (error) {
            toast('Erreur réseau', 'error');
        }
    };

    const handleUpdate = async () => {
        if (!editContent.trim()) return;

        try {
            const res = await fetch(`/api/feed/comment/${comment.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: editContent })
            });

            if (res.ok) {
                setIsEditing(false);
                toast('Commentaire modifié !', 'success');
                if (onUpdate) await onUpdate(comment.id, editContent);
            } else {
                toast('Erreur lors de la modification', 'error');
            }
        } catch (error) {
            toast('Erreur réseau', 'error');
        }
    };

    const handleDelete = async () => {
        if (!confirm('Supprimer ce commentaire ?')) return;

        try {
            const res = await fetch(`/api/feed/comment/${comment.id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                toast('Commentaire supprimé', 'success');
                if (onDelete) await onDelete(comment.id);
            } else {
                toast('Erreur lors de la suppression', 'error');
            }
        } catch (error) {
            toast('Erreur réseau', 'error');
        }
    };

    const timeAgo = formatDistanceToNow(new Date(comment.createdAt), {
        addSuffix: true,
        locale: fr
    });

    return (
        <div className={styles.commentItem} style={{ marginLeft: `${depth * 20}px` }}>
            <div className={styles.avatar}>
                {comment.user.image ? (
                    <Image
                        src={comment.user.image}
                        alt={comment.user.name}
                        width={32}
                        height={32}
                        className={styles.avatarImg}
                    />
                ) : (
                    <div className={styles.avatarPlaceholder}>
                        {comment.user.name?.charAt(0).toUpperCase()}
                    </div>
                )}
            </div>

            <div className={styles.commentContent}>
                <div className={styles.commentHeader}>
                    <span className={styles.authorName}>
                        {comment.user.name}
                        {comment.user.role === 'ADMIN' && (
                            <span className={styles.adminBadge}>✓ Admin</span>
                        )}
                    </span>
                    <span className={styles.timestamp}>{timeAgo}</span>

                    {canModify && (
                        <div className={styles.menuContainer}>
                            <button
                                className={styles.menuButton}
                                onClick={() => setShowMenu(!showMenu)}
                            >
                                <MoreVertical size={16} />
                            </button>
                            {showMenu && (
                                <div className={styles.menu}>
                                    <button onClick={() => { setIsEditing(true); setShowMenu(false); }}>
                                        <Edit2 size={14} /> Modifier
                                    </button>
                                    <button onClick={() => { handleDelete(); setShowMenu(false); }}>
                                        <Trash2 size={14} /> Supprimer
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {isEditing ? (
                    <div className={styles.editForm}>
                        <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className={styles.editTextarea}
                        />
                        <div className={styles.editActions}>
                            <button onClick={handleUpdate} className={styles.saveBtn}>
                                Enregistrer
                            </button>
                            <button onClick={() => { setIsEditing(false); setEditContent(comment.content); }} className={styles.cancelBtn}>
                                Annuler
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className={styles.commentText}>{comment.content}</p>
                )}

                <div className={styles.actions}>
                    <button
                        className={`${styles.actionBtn} ${isLiked ? styles.liked : ''}`}
                        onClick={handleLike}
                    >
                        <Heart size={14} fill={isLiked ? '#e74c3c' : 'none'} />
                        {likeCount > 0 && <span>{likeCount}</span>}
                    </button>

                    {depth < 2 && (
                        <button
                            className={styles.actionBtn}
                            onClick={() => setShowReplyForm(!showReplyForm)}
                        >
                            <MessageCircle size={14} />
                            Répondre
                        </button>
                    )}
                </div>

                {showReplyForm && (
                    <form onSubmit={handleReplySubmit} className={styles.replyForm}>
                        <input
                            type="text"
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Écrire une réponse..."
                            className={styles.replyInput}
                            autoFocus
                        />
                        <button type="submit" className={styles.replyBtn}>
                            Envoyer
                        </button>
                    </form>
                )}

                {/* Render replies recursively */}
                {comment.replies && comment.replies.length > 0 && (
                    <div className={styles.replies}>
                        {comment.replies.map((reply: any) => (
                            <CommentItem
                                key={reply.id}
                                comment={reply}
                                onReply={onReply}
                                onDelete={onDelete}
                                onUpdate={onUpdate}
                                depth={depth + 1}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
