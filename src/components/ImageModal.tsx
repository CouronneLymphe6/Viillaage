'use client';

import { useEffect } from 'react';
import { X, ArrowLeft } from 'lucide-react';

interface ImageModalProps {
    src: string;
    alt: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function ImageModal({ src, alt, isOpen, onClose }: ImageModalProps) {
    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.95)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
            }}
            onClick={onClose}
        >
            {/* Back Button - Top Left */}
            <button
                onClick={onClose}
                style={{
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    padding: '12px 20px',
                    backgroundColor: 'rgba(0, 191, 165, 0.9)',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s',
                    zIndex: 10000,
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '0.95rem',
                }}
                title="Retour"
            >
                <ArrowLeft size={20} />
                <span>Retour</span>
            </button>

            {/* Close Button - Top Right */}
            <button
                onClick={onClose}
                style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    padding: '12px',
                    backgroundColor: 'rgba(231, 76, 60, 0.9)',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                    zIndex: 10000,
                }}
                title="Fermer (Esc)"
            >
                <X size={24} color="white" />
            </button>

            {/* Image - Using native img tag for full quality */}
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    maxWidth: '95vw',
                    maxHeight: '95vh',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={src}
                    alt={alt}
                    style={{
                        maxWidth: '95vw',
                        maxHeight: '95vh',
                        width: 'auto',
                        height: 'auto',
                        objectFit: 'contain',
                        borderRadius: '8px',
                    }}
                />
            </div>

            {/* Instructions */}
            <div
                style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '20px',
                    fontSize: '0.9rem',
                    textAlign: 'center',
                }}
            >
                Utilisez le zoom de votre navigateur (Ctrl +/-) pour agrandir • Cliquez pour fermer
            </div>
        </div>
    );
}
