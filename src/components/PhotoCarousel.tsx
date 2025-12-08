'use client';

import { useState, useRef } from 'react';

interface PhotoCarouselProps {
    photos: string[];
    title: string;
}

export default function PhotoCarousel({ photos, title }: PhotoCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    if (!photos || photos.length === 0) {
        return (
            <div style={{
                height: '220px',
                backgroundColor: 'var(--background)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-secondary)',
                borderRadius: '12px 12px 0 0',
            }}>
                📷 Aucune photo
            </div>
        );
    }

    const handleScroll = () => {
        if (scrollContainerRef.current) {
            const scrollLeft = scrollContainerRef.current.scrollLeft;
            const width = scrollContainerRef.current.offsetWidth;
            const newIndex = Math.round(scrollLeft / width);
            setCurrentIndex(newIndex);
        }
    };

    const scrollToIndex = (index: number) => {
        if (scrollContainerRef.current) {
            const width = scrollContainerRef.current.offsetWidth;
            scrollContainerRef.current.scrollTo({
                left: index * width,
                behavior: 'smooth',
            });
        }
    };

    return (
        <div style={{
            position: 'relative',
            height: '220px',
            backgroundColor: 'var(--background)',
            overflow: 'hidden',
            borderRadius: '12px 12px 0 0',
        }}>
            {/* Scrollable container */}
            <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                style={{
                    display: 'flex',
                    height: '100%',
                    overflowX: 'auto',
                    scrollSnapType: 'x mandatory',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                }}
                className="photo-scroll-container"
            >
                {photos.map((photo, index) => (
                    <div
                        key={index}
                        style={{
                            minWidth: '100%',
                            height: '100%',
                            scrollSnapAlign: 'start',
                            backgroundColor: '#f5f5f5',
                            overflow: 'hidden',
                        }}
                    >
                        <img
                            src={photo}
                            alt={`${title} - Photo ${index + 1}`}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                display: 'block',
                            }}
                        />
                    </div>
                ))}
            </div>

            {/* Photo indicators */}
            {photos.length > 1 && (
                <div style={{
                    position: 'absolute',
                    bottom: '12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: '6px',
                    zIndex: 10,
                }}>
                    {photos.map((_, index) => (
                        <div
                            key={index}
                            onClick={(e) => {
                                e.stopPropagation();
                                scrollToIndex(index);
                            }}
                            style={{
                                width: index === currentIndex ? '24px' : '8px',
                                height: '8px',
                                borderRadius: '4px',
                                backgroundColor: index === currentIndex ? 'white' : 'rgba(255, 255, 255, 0.5)',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Hide scrollbar with CSS */}
            <style jsx>{`
                .photo-scroll-container::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
}
