'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, ZoomIn, ZoomOut, Download } from 'lucide-react';

interface ImageModalProps {
    src: string;
    alt: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function ImageModal({ src, alt, isOpen, onClose }: ImageModalProps) {
    const [zoom, setZoom] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    // Reset zoom and position when modal opens
    useEffect(() => {
        if (isOpen) {
            setZoom(1);
            setPosition({ x: 0, y: 0 });
        }
    }, [isOpen]);

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

    const handleZoomIn = () => {
        setZoom(prev => Math.min(prev + 0.5, 4));
    };

    const handleZoomOut = () => {
        setZoom(prev => Math.max(prev - 0.5, 0.5));
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (zoom > 1) {
            setIsDragging(true);
            setDragStart({
                x: e.clientX - position.x,
                y: e.clientY - position.y
            });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging && zoom > 1) {
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = src;
        link.download = alt || 'image';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

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
                cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            {/* Controls Bar */}
            <div
                style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    display: 'flex',
                    gap: '12px',
                    zIndex: 10000,
                }}
            >
                <button
                    onClick={handleZoomOut}
                    disabled={zoom <= 0.5}
                    style={{
                        padding: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: zoom <= 0.5 ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: zoom <= 0.5 ? 0.5 : 1,
                        transition: 'all 0.2s',
                    }}
                    title="Dézoomer"
                >
                    <ZoomOut size={20} color="#263238" />
                </button>

                <div
                    style={{
                        padding: '12px 16px',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '8px',
                        fontWeight: '600',
                        color: '#263238',
                        minWidth: '60px',
                        textAlign: 'center',
                    }}
                >
                    {Math.round(zoom * 100)}%
                </div>

                <button
                    onClick={handleZoomIn}
                    disabled={zoom >= 4}
                    style={{
                        padding: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: zoom >= 4 ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: zoom >= 4 ? 0.5 : 1,
                        transition: 'all 0.2s',
                    }}
                    title="Zoomer"
                >
                    <ZoomIn size={20} color="#263238" />
                </button>

                <button
                    onClick={handleDownload}
                    style={{
                        padding: '12px',
                        backgroundColor: 'rgba(0, 191, 165, 0.9)',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                    }}
                    title="Télécharger"
                >
                    <Download size={20} color="white" />
                </button>

                <button
                    onClick={onClose}
                    style={{
                        padding: '12px',
                        backgroundColor: 'rgba(231, 76, 60, 0.9)',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                    }}
                    title="Fermer (Esc)"
                >
                    <X size={20} color="white" />
                </button>
            </div>

            {/* Image Container */}
            <div
                style={{
                    position: 'relative',
                    maxWidth: '90vw',
                    maxHeight: '90vh',
                    transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                    transition: isDragging ? 'none' : 'transform 0.2s ease-out',
                }}
                onMouseDown={handleMouseDown}
            >
                <Image
                    src={src}
                    alt={alt}
                    width={1920}
                    height={1080}
                    style={{
                        maxWidth: '90vw',
                        maxHeight: '90vh',
                        width: 'auto',
                        height: 'auto',
                        objectFit: 'contain',
                        userSelect: 'none',
                        pointerEvents: 'none',
                    }}
                    quality={100}
                    priority
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
                {zoom > 1 ? 'Glissez pour déplacer l\'image' : 'Cliquez sur les boutons pour zoomer'}
            </div>
        </div>
    );
}
