'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Mail, Globe, Share2, Heart } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useProBusiness } from '@/hooks/useProBusiness';
import Loader from '@/components/Loader';
import { ProductsTab } from '@/components/pro/ProductsTab';
import { PostsTab } from '@/components/pro/PostsTab';
import { AgendaTab } from '@/components/pro/AgendaTab';
import { ProjectsTab } from '@/components/pro/ProjectsTab';

export default function ProDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { data: session } = useSession();
    const [businessId, setBusinessId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('presentation');

    const { business, loading, isFollowing, toggleFollow } = useProBusiness(businessId);

    useEffect(() => {
        params.then(p => setBusinessId(p.id));
    }, [params]);

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <Loader size="large" text="Chargement du commerce..." />
            </div>
        );
    }

    if (!business) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>❌</div>
                <h2>Commerce non trouvé</h2>
                <button
                    onClick={() => router.push('/village')}
                    style={{
                        marginTop: '20px',
                        padding: '12px 24px',
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--radius-full)',
                        cursor: 'pointer',
                    }}
                >
                    Retour aux Pros
                </button>
            </div>
        );
    }

    const photosArray = JSON.parse(business.photos || "[]");
    const coverPhoto = photosArray[0];
    const isOwner = session?.user?.id === business.ownerId;

    return (
        <div style={{ minHeight: '100vh', paddingBottom: '40px' }}>
            {/* Header */}
            <div style={{ position: 'relative', marginBottom: '20px' }}>
                {coverPhoto ? (
                    <div style={{
                        width: '100%',
                        height: '300px',
                        backgroundImage: `url(${coverPhoto})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
                    }} />
                ) : (
                    <div style={{
                        width: '100%',
                        height: '300px',
                        background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                        borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '4rem',
                    }}>
                        🏪
                    </div>
                )}

                <button
                    onClick={() => router.push('/village')}
                    style={{
                        position: 'absolute',
                        top: '20px',
                        left: '20px',
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    }}
                >
                    <ArrowLeft size={20} />
                </button>

                <div style={{
                    position: 'absolute',
                    bottom: '-60px',
                    left: '20px',
                    right: '20px',
                    backgroundColor: 'var(--secondary)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '20px',
                    boxShadow: 'var(--shadow-lg)',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                <h1 style={{ fontSize: '1.75rem', margin: 0 }}>{business.name}</h1>
                                {business.type === 'ARTISAN' && (
                                    <span style={{
                                        backgroundColor: 'var(--accent)',
                                        color: 'white',
                                        padding: '4px 12px',
                                        borderRadius: '12px',
                                        fontSize: '0.75rem',
                                        fontWeight: '600',
                                    }}>
                                        Artisan Recommandé
                                    </span>
                                )}
                            </div>
                            <p style={{ color: 'var(--primary)', fontWeight: '600', marginBottom: '8px' }}>
                                {business.category}
                            </p>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                {business.description}
                            </p>
                        </div>

                        {!isOwner && session && (
                            <button
                                onClick={toggleFollow}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: isFollowing ? 'var(--secondary)' : 'var(--primary)',
                                    color: isFollowing ? 'var(--text)' : 'white',
                                    border: isFollowing ? '2px solid var(--border)' : 'none',
                                    borderRadius: 'var(--radius-full)',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    transition: 'all 0.2s',
                                }}
                            >
                                <Heart size={18} fill={isFollowing ? 'var(--primary)' : 'none'} />
                                {isFollowing ? 'Abonné' : 'Suivre'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div style={{ height: '80px' }} />

            {/* Quick Actions */}
            <div style={{
                display: 'flex',
                gap: '12px',
                padding: '0 20px',
                marginBottom: '24px',
                flexWrap: 'wrap',
            }}>
                {business.email && (
                    <a href={`mailto:${business.email}`} style={{
                        flex: 1,
                        minWidth: '140px',
                        padding: '12px 16px',
                        backgroundColor: 'var(--secondary)',
                        border: '2px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        fontWeight: '600',
                        textDecoration: 'none',
                        color: 'var(--text)',
                        cursor: 'pointer',
                    }}>
                        <Mail size={18} />
                        Écrire
                    </a>
                )}
                {business.website && (
                    <a href={business.website} target="_blank" rel="noopener noreferrer" style={{
                        flex: 1,
                        minWidth: '140px',
                        padding: '12px 16px',
                        backgroundColor: 'var(--secondary)',
                        border: '2px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        fontWeight: '600',
                        textDecoration: 'none',
                        color: 'var(--text)',
                        cursor: 'pointer',
                    }}>
                        <Globe size={18} />
                        Site web
                    </a>
                )}
                <button onClick={() => {
                    if (navigator.share) {
                        navigator.share({
                            title: business.name,
                            text: business.description,
                            url: window.location.href,
                        });
                    }
                }} style={{
                    flex: 1,
                    minWidth: '140px',
                    padding: '12px 16px',
                    backgroundColor: 'var(--secondary)',
                    border: '2px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                }}>
                    <Share2 size={18} />
                    Partager
                </button>
            </div>

            {/* Tab Navigation */}
            <div style={{
                borderBottom: '2px solid var(--border)',
                marginBottom: '24px',
                overflowX: 'auto',
            }}>
                <div style={{
                    display: 'flex',
                    gap: '8px',
                    padding: '0 20px',
                    minWidth: 'fit-content',
                }}>
                    {['presentation', 'products', 'agenda', 'projects', 'posts', 'contact'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: '12px 20px',
                                backgroundColor: 'transparent',
                                border: 'none',
                                borderBottom: activeTab === tab ? '3px solid var(--primary)' : '3px solid transparent',
                                color: activeTab === tab ? 'var(--primary)' : 'var(--text-secondary)',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {tab === 'presentation' && '📋 Présentation'}
                            {tab === 'products' && '🛍️ Produits'}
                            {tab === 'agenda' && '📅 Agenda'}
                            {tab === 'projects' && '🚀 Projets'}
                            {tab === 'posts' && '📢 Actualités'}
                            {tab === 'contact' && '📞 Contact'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div style={{ padding: '0 20px' }}>
                {activeTab === 'presentation' && (
                    <div>
                        <h2 style={{ marginBottom: '16px' }}>À propos</h2>
                        <p style={{ lineHeight: '1.6', marginBottom: '24px' }}>{business.description}</p>

                        {business.address && (
                            <div style={{ marginBottom: '16px' }}>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>📍 Adresse</h3>
                                <p style={{ color: 'var(--text-secondary)' }}>{business.address}</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'products' && businessId && (
                    <ProductsTab businessId={businessId} isOwner={isOwner} />
                )}

                {activeTab === 'agenda' && businessId && (
                    <AgendaTab businessId={businessId} isOwner={isOwner} />
                )}

                {activeTab === 'projects' && businessId && (
                    <ProjectsTab businessId={businessId} isOwner={isOwner} />
                )}

                {activeTab === 'posts' && businessId && (
                    <PostsTab businessId={businessId} isOwner={isOwner} />
                )}

                {activeTab === 'contact' && (
                    <div>
                        <h2 style={{ marginBottom: '16px' }}>Contact</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {business.phone && (
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>📞 Téléphone</h3>
                                    <p style={{ color: 'var(--text-secondary)' }}>{business.phone}</p>
                                </div>
                            )}
                            {business.email && (
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>✉️ Email</h3>
                                    <a href={`mailto:${business.email}`} style={{ color: 'var(--primary)' }}>
                                        {business.email}
                                    </a>
                                </div>
                            )}
                            {business.website && (
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>🌐 Site web</h3>
                                    <a href={business.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>
                                        {business.website}
                                    </a>
                                </div>
                            )}
                            {business.address && (
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>📍 Adresse</h3>
                                    <p style={{ color: 'var(--text-secondary)' }}>{business.address}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
