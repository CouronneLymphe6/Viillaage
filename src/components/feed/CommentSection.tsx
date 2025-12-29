"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { Send, MessageSquare } from 'lucide-react';

interface Comment {
    id: string;
    content: string;
    createdAt: string;
    user: {
        id: string;
        name: string | null;
        image: string | null;
    };
}

interface CommentSectionProps {
    targetId: string;
    targetType: string;
    onCommentAdded?: () => void;
}

export function CommentSection({ targetId, targetType, onCommentAdded }: CommentSectionProps) {
    const { data: session } = useSession();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchComments = async () => {
        try {
            const res = await fetch(`/api/feed/comments?id=${targetId}&type=${targetType}`);
            if (res.ok) {
                const data = await res.json();
                setComments(data);
            }
        } catch (error) {
            console.error('Failed to fetch comments:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [targetId, targetType]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/feed/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: targetId,
                    type: targetType,
                    content: newComment
                })
            });

            if (res.ok) {
                const addedComment = await res.json();
                setComments(prev => [...prev, addedComment]);
                setNewComment('');
                if (onCommentAdded) onCommentAdded();
            }
        } catch (error) {
            console.error('Failed to add comment:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-gray-50 p-4 border-t border-gray-100">
            {/* List of comments */}
            <div className="space-y-4 mb-4 max-h-60 overflow-y-auto">
                {isLoading ? (
                    <div className="text-center py-2 text-sm text-gray-400">Chargement des commentaires...</div>
                ) : comments.length === 0 ? (
                    <div className="text-center py-2 text-sm text-gray-400 font-light italic">Aucun commentaire pour le moment.</div>
                ) : (
                    comments.map(comment => (
                        <div key={comment.id} className="flex space-x-3">
                            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                                {comment.user.image ? (
                                    <Image src={comment.user.image} alt={comment.user.name || 'User'} fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-xs font-bold">
                                        {comment.user.name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-semibold text-xs text-gray-900">{comment.user.name}</span>
                                    <span className="text-[10px] text-gray-400">
                                        {new Date(comment.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 leading-snug">{comment.content}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Post comment form */}
            {session && (
                <form onSubmit={handleSubmit} className="flex items-center space-x-2">
                    <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                        {session.user?.image ? (
                            <Image src={session.user.image} alt={session.user.name || 'User'} fill className="object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-xs font-bold">
                                {session.user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                        )}
                    </div>
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Ajouter un commentaire..."
                            className="w-full bg-white border border-gray-200 rounded-full py-2 px-4 pr-10 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                        />
                        <button
                            type="submit"
                            disabled={!newComment.trim() || isSubmitting}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-primary hover:text-primary-dark transition-colors disabled:text-gray-300"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
