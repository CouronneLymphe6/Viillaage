'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { MessageCircle, Plus, ThumbsUp, Send, Edit2, Trash2 } from 'lucide-react';
import { compressImage, formatFileSize } from '@/lib/imageUtils';

interface AssociationPost {
    id: string;
    content: string;
    mediaUrl?: string | null;
    mediaType?: string | null;
    createdAt: string;
    likes: { userId: string }[];
    comments: Comment[];
    likeCount: number;
    commentCount: number;
}

interface Comment {
    id: string;
    content: string;
    createdAt: string;
    user: {
        name: string | null;
        image: string | null;
    };
}

interface NewsTabProps {
    associationId: string;
    isOwner: boolean;
}

export function NewsTab({ associationId, isOwner }: NewsTabProps) {
    const { data: session } = useSession();
    const [posts, setPosts] = useState<AssociationPost[]>([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingPost, setEditingPost] = useState<AssociationPost | null>(null);
    const [newComment, setNewComment] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        fetchPosts();
    }, [associationId]);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/associations/${associationId}/posts`);
            if (response.ok) {
                const data = await response.json();
                setPosts(data);
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleLike = async (postId: string) => {
        try {
            const response = await fetch(`/api/associations/${associationId}/posts/${postId}/like`, {
                method: 'POST',
            });
            if (response.ok) {
                fetchPosts();
            }
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const addComment = async (postId: string) => {
        if (!newComment[postId]?.trim()) return;
        try {
            const response = await fetch(`/api/associations/${associationId}/posts/${postId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newComment[postId] }),
            });
            if (response.ok) {
                setNewComment({ ...newComment, [postId]: '' });
                fetchPosts();
            }
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    const handleDelete = async (postId: string) => {
        if (!confirm('Voulez-vous vraiment supprimer cette publication ?')) return;
        try {
            const response = await fetch(`/api/associations/${associationId}/posts/${postId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                fetchPosts();
            }
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    };

    const handleEdit = (post: AssociationPost) => {
        setEditingPost(post);
        setShowForm(true);
    };

    if (loading) {
        return <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Chargement...</p>;
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0 }}>Actualités</h2>
                {isOwner && (
                    <button
                        onClick={() => {
                            setEditingPost(null);
                            setShowForm(true);
                        }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 16px',
                            backgroundColor: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            fontWeight: '600',
                            cursor: 'pointer',
                        }}
                    >
                        <Plus size={18} />
                        Publier
                    </button>
                )}
            </div>

            {posts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <MessageCircle size={48} style={{ color: 'var(--text-secondary)', marginBottom: '16px' }} />
                    <p style={{ color: 'var(--text-secondary)' }}>
                        {isOwner ? 'Publiez votre première actualité' : 'Aucune publication pour le moment'}
                    </p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {posts.map((post) => {
                        const isLiked = post.likes.some(like => like.userId === session?.user?.id);

                        return (
                            <div key={post.id} style={{
                                backgroundColor: 'var(--secondary)',
                                borderRadius: 'var(--radius-md)',
                                padding: '20px',
                                boxShadow: 'var(--shadow-sm)',
                                position: 'relative',
                            }}>
                                {isOwner && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '12px',
                                        right: '12px',
                                        display: 'flex',
                                        gap: '8px',
                                        zIndex: 1,
                                    }}>
                                        <button
                                            onClick={() => handleEdit(post)}
                                            style={{
                                                width: '32px',
                                                height: '32px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                border: 'none',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                            }}
                                            title="Modifier"
                                        >
                                            <Edit2 size={16} color="#666" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(post.id)}
                                            style={{
                                                width: '32px',
                                                height: '32px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                border: 'none',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                            }}
                                            title="Supprimer"
                                        >
                                            <Trash2 size={16} color="#c33" />
                                        </button>
                                    </div>
                                )}
                                <div style={{ marginBottom: '12px' }}>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                        {new Date(post.createdAt).toLocaleDateString('fr-FR', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>

                                <p style={{ lineHeight: '1.6', marginBottom: '12px', whiteSpace: 'pre-wrap' }}>
                                    {post.content}
                                </p>

                                {post.mediaUrl && post.mediaType === 'PHOTO' && (
                                    <div style={{
                                        width: '100%',
                                        height: '300px',
                                        borderRadius: 'var(--radius-md)',
                                        overflow: 'hidden',
                                        marginBottom: '12px',
                                        backgroundColor: '#f5f5f5',
                                    }}>
                                        <img
                                            src={post.mediaUrl}
                                            alt="Post media"
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                display: 'block'
                                            }}
                                        />
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: '16px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                                    <button
                                        onClick={() => session && toggleLike(post.id)}
                                        disabled={!session}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '8px 12px',
                                            backgroundColor: isLiked ? 'rgba(var(--primary-rgb), 0.1)' : 'transparent',
                                            border: 'none',
                                            borderRadius: 'var(--radius-sm)',
                                            cursor: session ? 'pointer' : 'not-allowed',
                                            color: isLiked ? 'var(--primary)' : 'var(--text-secondary)',
                                            fontWeight: '600',
                                            fontSize: '0.9rem',
                                        }}
                                    >
                                        <ThumbsUp size={18} fill={isLiked ? 'var(--primary)' : 'none'} />
                                        {post.likeCount} J'aime
                                    </button>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        color: 'var(--text-secondary)',
                                        fontSize: '0.9rem',
                                    }}>
                                        <MessageCircle size={18} />
                                        {post.commentCount} Commentaire{post.commentCount > 1 ? 's' : ''}
                                    </div>
                                </div>

                                {post.comments.length > 0 && (
                                    <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                                        {post.comments.map((comment) => (
                                            <div key={comment.id} style={{ marginBottom: '12px', display: 'flex', gap: '12px' }}>
                                                <div style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '50%',
                                                    backgroundColor: 'var(--primary)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'white',
                                                    fontWeight: '600',
                                                    flexShrink: 0,
                                                }}>
                                                    {comment.user.name?.[0]?.toUpperCase() || '?'}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <p style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '4px' }}>
                                                        {comment.user.name || 'Utilisateur'}
                                                    </p>
                                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                                        {comment.content}
                                                    </p>
                                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                                        {new Date(comment.createdAt).toLocaleDateString('fr-FR')}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {session && (
                                    <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                                        <input
                                            type="text"
                                            placeholder="Ajouter un commentaire..."
                                            value={newComment[post.id] || ''}
                                            onChange={(e) => setNewComment({ ...newComment, [post.id]: e.target.value })}
                                            onKeyPress={(e) => e.key === 'Enter' && addComment(post.id)}
                                            style={{
                                                flex: 1,
                                                padding: '10px 14px',
                                                border: '2px solid var(--border)',
                                                borderRadius: 'var(--radius-full)',
                                                backgroundColor: 'var(--background)',
                                                fontSize: '0.9rem',
                                            }}
                                        />
                                        <button
                                            onClick={() => addComment(post.id)}
                                            disabled={!newComment[post.id]?.trim()}
                                            style={{
                                                padding: '10px 16px',
                                                backgroundColor: 'var(--primary)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: 'var(--radius-full)',
                                                cursor: newComment[post.id]?.trim() ? 'pointer' : 'not-allowed',
                                                opacity: newComment[post.id]?.trim() ? 1 : 0.5,
                                            }}
                                        >
                                            <Send size={18} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {showForm && (
                <PostForm
                    associationId={associationId}
                    post={editingPost}
                    onClose={() => {
                        setShowForm(false);
                        setEditingPost(null);
                    }}
                    onSuccess={() => {
                        fetchPosts();
                        setShowForm(false);
                        setEditingPost(null);
                    }}
                />
            )}
        </div>
    );
}

function PostForm({ associationId, post, onClose, onSuccess }: { associationId: string, post: AssociationPost | null, onClose: () => void, onSuccess: () => void }) {
    const [formData, setFormData] = useState({
        content: post?.content || '',
        mediaUrl: post?.mediaUrl || '',
    });
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadError(null);

        if (!file.type.startsWith('image/')) {
            setUploadError('Veuillez sélectionner une image valide (JPG, PNG, etc.)');
            return;
        }

        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > 10) {
            setUploadError(`Image trop grande (${formatFileSize(file.size)}). Maximum 10MB.`);
            return;
        }

        setUploading(true);
        try {
            const compressed = await compressImage(file, 1200, 1200, 0.8);
            setFormData({ ...formData, mediaUrl: compressed });
            setUploadError(null);
        } catch (error) {
            console.error('Image compression error:', error);
            setUploadError('Erreur lors du traitement de l\'image. Veuillez réessayer.');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = post ? `/api/associations/${associationId}/posts/${post.id}` : `/api/associations/${associationId}/posts`;
            const method = post ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: formData.content,
                    mediaUrl: formData.mediaUrl || null,
                    mediaType: formData.mediaUrl ? 'PHOTO' : null,
                }),
            });

            if (response.ok) {
                onSuccess();
            }
        } catch (error) {
            console.error('Error saving post:', error);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
        }} onClick={onClose}>
            <div onClick={(e) => e.stopPropagation()} style={{
                backgroundColor: 'var(--secondary)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                maxWidth: '500px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
            }}>
                <h2 style={{ marginBottom: '20px' }}>{post ? 'Modifier la publication' : 'Nouvelle publication'}</h2>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Message *</label>
                        <textarea
                            required
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            rows={5}
                            placeholder="Quoi de neuf ?"
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '2px solid var(--border)',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '1rem',
                                resize: 'vertical',
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Photo (optionnelle)</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={uploading}
                            style={{
                                width: '100%',
                                padding: '10px',
                                border: '2px solid var(--border)',
                                borderRadius: 'var(--radius-md)',
                            }}
                        />
                        {uploading && <p style={{ marginTop: '8px', color: 'var(--primary)' }}>Compression en cours...</p>}
                        {uploadError && <p style={{ marginTop: '8px', color: '#c33', fontSize: '0.9rem' }}>{uploadError}</p>}
                        {formData.mediaUrl && (
                            <div style={{ marginTop: '12px' }}>
                                <img src={formData.mediaUrl} alt="Preview" style={{ width: '100%', borderRadius: 'var(--radius-md)' }} />
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                flex: 1,
                                padding: '12px',
                                backgroundColor: 'var(--background)',
                                border: '2px solid var(--border)',
                                borderRadius: 'var(--radius-md)',
                                fontWeight: '600',
                                cursor: 'pointer',
                            }}
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={uploading}
                            style={{
                                flex: 1,
                                padding: '12px',
                                backgroundColor: 'var(--primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: 'var(--radius-md)',
                                fontWeight: '600',
                                cursor: uploading ? 'not-allowed' : 'pointer',
                                opacity: uploading ? 0.5 : 1,
                            }}
                        >
                            {post ? 'Modifier' : 'Publier'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
