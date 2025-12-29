"use client";

import { useState } from 'react';
import { FeedItem } from '@/lib/feed/types';
import Image from 'next/image';
import { Heart, MessageSquare, Share2, ShieldAlert, Euro, Calendar, Megaphone } from 'lucide-react';
import { CommentSection } from './CommentSection';

interface FeedCardProps {
    item: FeedItem;
    onLike?: (id: string, type: string) => void;
    onComment?: (id: string, type: string) => void;
}

export function FeedCard({ item, onLike, onComment }: FeedCardProps) {
    const [isLiked, setIsLiked] = useState(item.metrics.isLiked);
    const [likeCount, setLikeCount] = useState(item.metrics.likes);
    const [showComments, setShowComments] = useState(false);
    const [commentCount, setCommentCount] = useState(item.metrics.comments);

    const handleLike = async () => {
        // Optimistic update
        const previousLiked = isLiked;
        const previousCount = likeCount;

        setIsLiked(!isLiked);
        setLikeCount(prev => isLiked ? prev - 1 : prev + 1);

        try {
            const res = await fetch('/api/feed/like', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: item.originalId,
                    type: item.type
                })
            });

            if (!res.ok) throw new Error('Failed to like');

            const data = await res.json();
            setIsLiked(data.liked);
            setLikeCount(data.count);

            if (onLike) onLike(item.id, item.type);
        } catch (error) {
            console.error(error);
            // Revert on error
            setIsLiked(previousLiked);
            setLikeCount(previousCount);
        }
    };

    const handleCommentToggle = () => {
        setShowComments(!showComments);
        if (onComment) onComment(item.id, item.type);
    };

    const getIcon = () => {
        switch (item.type) {
            case 'ALERT': return <ShieldAlert className="w-5 h-5 text-red-500" />;
            case 'PRO_POST': return <Megaphone className="w-5 h-5 text-blue-500" />;
            case 'LISTING': return <Euro className="w-5 h-5 text-green-500" />;
            case 'EVENT':
            case 'ASSOCIATION_EVENT': return <Calendar className="w-5 h-5 text-orange-500" />;
            default: return null;
        }
    };

    const getBadgeColor = () => {
        switch (item.type) {
            case 'ALERT': return 'bg-red-100 text-red-800 border-red-200';
            case 'PRO_POST': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'ASSOCIATION_POST': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'LISTING': return 'bg-green-100 text-green-800 border-green-200';
            case 'EVENT': return 'bg-orange-100 text-orange-800 border-orange-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getCategoryLabel = () => {
        switch (item.type) {
            case 'ALERT': return item.metadata?.alertType || 'Alerte';
            case 'PRO_POST': return 'Commerce';
            case 'ASSOCIATION_POST': return 'Association';
            case 'LISTING': return item.metadata?.listingCategory || 'Annonce';
            case 'EVENT': return 'Agenda';
            case 'ASSOCIATION_EVENT': return 'Événement Asso';
            default: return item.author.subline || 'Discussion';
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
            {/* Header */}
            <div className="p-4 flex items-start justify-between">
                <div className="flex items-center space-x-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100">
                        {item.author.image ? (
                            <Image
                                src={item.author.image}
                                alt={item.author.name}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold">
                                {item.author.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 leading-snug">{item.author.name}</h3>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span>{new Date(item.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                            {item.type !== 'FEED_POST' && (
                                <>
                                    <span>•</span>
                                    <span className={`px-2 py-0.5 rounded-full border ${getBadgeColor()} flex items-center space-x-1`}>
                                        {getIcon()}
                                        <span>{getCategoryLabel()}</span>
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="px-4 pb-2">
                {item.content.title && <h4 className="font-bold text-lg mb-2 text-gray-800">{item.content.title}</h4>}
                <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{item.content.text}</p>

                {/* Metadata Preview (e.g. Price, Event Date) */}
                {(item.metadata?.price || item.metadata?.eventDate) && (
                    <div className="mt-3 flex gap-2">
                        {item.metadata.price !== undefined && (
                            <span className="inline-flex items-center px-3 py-1 rounded-lg bg-green-50 text-green-700 text-sm font-medium">
                                <Euro className="w-4 h-4 mr-1" />
                                {item.metadata.price} €
                            </span>
                        )}
                        {item.metadata.eventDate && (
                            <span className="inline-flex items-center px-3 py-1 rounded-lg bg-orange-50 text-orange-700 text-sm font-medium">
                                <Calendar className="w-4 h-4 mr-1" />
                                {new Date(item.metadata.eventDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Media Attachment */}
            {item.content.mediaType === 'PHOTO' && item.content.mediaUrl && (
                <div className="mt-3 relative h-64 w-full bg-gray-50">
                    <Image
                        src={item.content.mediaUrl}
                        alt="Post content"
                        fill
                        className="object-cover"
                    />
                </div>
            )}

            {/* Actions */}
            <div className="px-4 py-3 border-t border-gray-50 flex items-center justify-between text-gray-500">
                <div className="flex space-x-6">
                    <button
                        onClick={handleLike}
                        className={`flex items-center space-x-1.5 transition-colors ${isLiked ? 'text-red-500' : 'hover:text-red-500'}`}
                    >
                        {isLiked ? <Heart className="w-6 h-6 fill-current" /> : <Heart className="w-6 h-6" />}
                        <span className="text-sm font-medium">{likeCount > 0 ? likeCount : 'J\'aime'}</span>
                    </button>

                    <button
                        onClick={handleCommentToggle}
                        className={`flex items-center space-x-1.5 transition-colors ${showComments ? 'text-blue-500' : 'hover:text-blue-500'}`}
                    >
                        <MessageSquare className="w-6 h-6" />
                        <span className="text-sm font-medium">{commentCount > 0 ? commentCount : 'Commenter'}</span>
                    </button>
                </div>

                <button className="hover:text-gray-700">
                    <Share2 className="w-5 h-5" />
                </button>
            </div>

            {/* Comments Section */}
            {showComments && (
                <CommentSection
                    targetId={item.originalId}
                    targetType={item.type}
                    onCommentAdded={() => setCommentCount(prev => prev + 1)}
                />
            )}
        </div>
    );
}
