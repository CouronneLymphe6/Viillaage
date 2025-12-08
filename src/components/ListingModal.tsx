'use client';

import { useState } from 'react';
import PhotoCarousel from './PhotoCarousel';

interface Listing {
    id: string;
    title: string;
    description: string;
    price?: number | null;
    category: string;
    photos: string[];
    createdAt: string;
    userId: string;
    user: {
        name: string | null;
    };
}

interface ListingModalProps {
    listing: Listing;
    isOpen: boolean;
    onClose: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    isOwner: boolean;
}

export default function ListingModal({ listing, isOpen, onClose, onEdit, onDelete, isOwner }: ListingModalProps) {
    if (!isOpen) return null;

    const categoryLabels: Record<string, string> = {
        SELL: '💰 Vente',
        GIVE: '🎁 Don',
        EXCHANGE: '🔄 Échange',
        LEND: '🤝 Prêt',
    };

    const getTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        if (diffInDays === 0) return "Aujourd'hui";
        if (diffInDays === 1) return "Hier";
        if (diffInDays < 7) return `Il y a ${diffInDays} jours`;
        if (diffInDays < 30) return `Il y a ${Math.floor(diffInDays / 7)} semaine${Math.floor(diffInDays / 7) > 1 ? 's' : ''}`;
        return date.toLocaleDateString('fr-FR');
    };

    return (
        <>
            {/* Overlay */}
            <div
                onClick={onClose}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px',
                    animation: 'fadeIn 0.2s ease-in-out',
                }}
            >
                {/* Modal */}
                <div
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        backgroundColor: 'var(--secondary)',
                        borderRadius: '16px',
                        maxWidth: '800px',
                        width: '100%',
                        maxHeight: '90vh',
                        overflow: 'auto',
                        position: 'relative',
                        animation: 'slideUp 0.3s ease-out',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                    }}
                >
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute',
                            top: '16px',
                            right: '16px',
                            backgroundColor: 'rgba(0, 0, 0, 0.6)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '40px',
                            height: '40px',
                            fontSize: '24px',
                            cursor: 'pointer',
                            zIndex: 10,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        ×
                    </button>

                    {/* Photo carousel */}
                    <div style={{ borderRadius: '16px 16px 0 0', overflow: 'hidden' }}>
                        <PhotoCarousel photos={listing.photos} title={listing.title} />
                    </div>

                    {/* Content */}
                    <div style={{ padding: '24px' }}>
                        {/* Category and Price */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <span style={{
                                fontWeight: '600',
                                color: 'white',
                                backgroundColor: 'var(--primary)',
                                padding: '6px 16px',
                                borderRadius: '20px',
                                fontSize: '0.95rem',
                            }}>
                                {categoryLabels[listing.category] || listing.category}
                            </span>
                            {listing.price && (
                                <span style={{
                                    fontWeight: '700',
                                    color: 'var(--accent)',
                                    fontSize: '2rem',
                                }}>
                                    {listing.price}€
                                </span>
                            )}
                        </div>

                        {/* Title */}
                        <h2 style={{
                            fontSize: '1.75rem',
                            fontWeight: '700',
                            marginBottom: '16px',
                            lineHeight: '1.3',
                        }}>{listing.title}</h2>

                        {/* Description */}
                        <div style={{
                            marginBottom: '24px',
                            paddingBottom: '24px',
                            borderBottom: '1px solid var(--border)',
                        }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '8px' }}>Description</h3>
                            <p style={{
                                color: 'var(--text-secondary)',
                                lineHeight: '1.6',
                                whiteSpace: 'pre-wrap',
                            }}>{listing.description}</p>
                        </div>

                        {/* Seller info */}
                        <div style={{
                            marginBottom: '24px',
                            paddingBottom: '24px',
                            borderBottom: '1px solid var(--border)',
                        }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '12px' }}>Vendeur</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '50%',
                                    backgroundColor: 'var(--primary)',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.5rem',
                                    fontWeight: '600',
                                }}>
                                    {listing.user.name?.charAt(0).toUpperCase() || '?'}
                                </div>
                                <div>
                                    <div style={{ fontWeight: '600', fontSize: '1.05rem' }}>{listing.user.name}</div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                        Publié {getTimeAgo(listing.createdAt)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            {isOwner ? (
                                <>
                                    <button
                                        onClick={() => {
                                            onEdit?.();
                                            onClose();
                                        }}
                                        style={{
                                            flex: 1,
                                            padding: '14px 24px',
                                            backgroundColor: 'var(--primary)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: 'var(--radius-sm)',
                                            fontSize: '1rem',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        ✏️ Modifier l'annonce
                                    </button>
                                    <button
                                        onClick={() => {
                                            onDelete?.();
                                            onClose();
                                        }}
                                        style={{
                                            flex: 1,
                                            padding: '14px 24px',
                                            backgroundColor: 'transparent',
                                            color: 'var(--danger)',
                                            border: '2px solid var(--danger)',
                                            borderRadius: 'var(--radius-sm)',
                                            fontSize: '1rem',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        🗑️ Supprimer
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => {
                                        // TODO: Navigate to messages with this user
                                        alert('Fonctionnalité de messagerie à venir !');
                                    }}
                                    style={{
                                        flex: 1,
                                        padding: '14px 24px',
                                        backgroundColor: 'var(--primary)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: 'var(--radius-sm)',
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                    }}
                                >
                                    💬 Contacter le vendeur
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Animations */}
            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                @keyframes slideUp {
                    from {
                        transform: translateY(30px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
            `}</style>
        </>
    );
}
