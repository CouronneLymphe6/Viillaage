'use client';

import dynamic from 'next/dynamic';

// Lazy load image upload components
export const ImageUpload = dynamic(() => import('./ImageUpload'), {
    ssr: false,
    loading: () => (
        <div style={{
            padding: '16px',
            border: '2px dashed var(--border)',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center',
            color: 'var(--text-secondary)',
        }}>
            Chargement du module d'upload...
        </div>
    ),
});

export const MultiImageUpload = dynamic(() => import('./MultiImageUpload'), {
    ssr: false,
    loading: () => (
        <div style={{
            padding: '16px',
            border: '2px dashed var(--border)',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center',
            color: 'var(--text-secondary)',
        }}>
            Chargement du module d'upload...
        </div>
    ),
});

export const PhotoCarousel = dynamic(() => import('./PhotoCarousel'), {
    ssr: true,
    loading: () => (
        <div style={{
            width: '100%',
            height: '250px',
            backgroundColor: 'var(--background)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
        }}>
            Chargement...
        </div>
    ),
});

// Lazy load modal components
export const ListingModal = dynamic(() => import('./ListingModal'), {
    ssr: false,
    loading: () => null,
});
