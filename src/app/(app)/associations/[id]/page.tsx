'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Globe, Share2, Heart } from 'lucide-react';
import { useAssociation } from '@/hooks/useAssociation';
import { EventsTab } from '@/components/association/EventsTab';
import { NewsTab } from '@/components/association/NewsTab';
import { ProjectsTab } from '@/components/association/ProjectsTab';

export default function AssociationDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { data: session } = useSession();
    const [associationId, setAssociationId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('presentation');

    const { association, loading, isFollowing, toggleFollow } = useAssociation(associationId);

    useEffect(() => {
        params.then(p => setAssociationId(p.id));
    }, [params]);

    if (loading || !association) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <p style={{ color: 'var(--text-secondary)' }}>Chargement...</p>
            </div>
        );
    }

    const isOwner = session?.user?.id === association.ownerId;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Back Button */}
            <button
                onClick={() => router.back()}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    marginBottom: '20px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                }}
            >
                <ArrowLeft size={20} />
                Retour
            </button>

            {/* Header Section */}
            <div style={{
                backgroundColor: 'var(--secondary)',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                marginBottom: '24px',
                boxShadow: 'var(--shadow-md)',
            }}>
                {/* Cover Photo */}
                {association.photoUrl && (
                    <div style={{
                        width: '100%',
                        height: '300px',
                        backgroundImage: `url(${association.photoUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }} />
                )}

                {/* Association Info */}
                <div style={{ padding: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ marginBottom: '8px' }}>
                                <span style={{
                                    display: 'inline-block',
                                    padding: '4px 12px',
                                    backgroundColor: 'rgba(var(--primary-rgb), 0.1)',
                                    color: 'var(--primary)',
                                    borderRadius: 'var(--radius-full)',
                                    fontSize: '0.85rem',
                                    fontWeight: '600',
                                }}>
                                    {association.category}
                                </span>
                            </div>
                            <h1 style={{ fontSize: '2.5rem', marginBottom: '12px' }}>{association.name}</h1>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.6' }}>
                                {association.description}
                            </p>
                        </div>

                        {/* Follow Button */}
                        {!isOwner && session && (
                            <button
                                onClick={toggleFollow}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '12px 24px',
                                    backgroundColor: isFollowing ? 'var(--background)' : 'var(--primary)',
                                    color: isFollowing ? 'var(--text)' : 'white',
                                    border: isFollowing ? '2px solid var(--border)' : 'none',
                                    borderRadius: 'var(--radius-md)',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    marginLeft: '20px',
                                }}
                            >
                                <Heart size={20} fill={isFollowing ? 'var(--primary)' : 'none'} />
                                {isFollowing ? 'Abonné' : 'Suivre'}
                            </button>
                        )}
                    </div>

                    {/* Additional Info */}
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '16px',
                        marginTop: '20px',
                        paddingTop: '20px',
                        borderTop: '1px solid var(--border)',
                        fontSize: '0.95rem',
                        color: 'var(--text-secondary)',
                    }}>
                        {association.president && (
                            <div>👤 <strong>Président·e :</strong> {association.president}</div>
                        )}
                        {association.phone && (
                            <div>📞 {association.phone}</div>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                        {association.email && (
                            <a
                                href={`mailto:${association.email}`}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '10px 16px',
                                    backgroundColor: 'var(--background)',
                                    border: '2px solid var(--border)',
                                    borderRadius: 'var(--radius-md)',
                                    color: 'var(--text)',
                                    textDecoration: 'none',
                                    fontWeight: '600',
                                    fontSize: '0.9rem',
                                }}
                            >
                                <Mail size={18} />
                                Email
                            </a>
                        )}
                        {association.website && (
                            <a
                                href={association.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '10px 16px',
                                    backgroundColor: 'var(--background)',
                                    border: '2px solid var(--border)',
                                    borderRadius: 'var(--radius-md)',
                                    color: 'var(--text)',
                                    textDecoration: 'none',
                                    fontWeight: '600',
                                    fontSize: '0.9rem',
                                }}
                            >
                                <Globe size={18} />
                                Site web
                            </a>
                        )}
                        <button
                            onClick={() => {
                                if (navigator.share) {
                                    navigator.share({
                                        title: association.name,
                                        text: association.description,
                                        url: window.location.href,
                                    });
                                } else {
                                    navigator.clipboard.writeText(window.location.href);
                                    alert('Lien copié !');
                                }
                            }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 16px',
                                backgroundColor: 'var(--background)',
                                border: '2px solid var(--border)',
                                borderRadius: 'var(--radius-md)',
                                color: 'var(--text)',
                                fontWeight: '600',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                            }}
                        >
                            <Share2 size={18} />
                            Partager
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div style={{
                backgroundColor: 'var(--secondary)',
                borderRadius: 'var(--radius-lg)',
                padding: '8px',
                marginBottom: '24px',
                display: 'flex',
                gap: '8px',
                overflowX: 'auto',
                boxShadow: 'var(--shadow-sm)',
            }}>
                {[
                    { id: 'presentation', label: '📋 Présentation' },
                    { id: 'events', label: '📅 Événements' },
                    { id: 'news', label: '📢 Actualités' },
                    { id: 'projects', label: '🚀 Projets' },
                    { id: 'contact', label: '📞 Contact' },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: '12px 20px',
                            backgroundColor: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                            color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            fontWeight: '600',
                            fontSize: '0.95rem',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.2s',
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div style={{
                backgroundColor: 'var(--secondary)',
                borderRadius: 'var(--radius-lg)',
                padding: '32px',
                minHeight: '400px',
                boxShadow: 'var(--shadow-sm)',
            }}>
                {activeTab === 'presentation' && (
                    <div>
                        <h2 style={{ marginBottom: '20px' }}>À propos</h2>
                        <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
                            {association.description}
                        </p>
                        {association.president && (
                            <div style={{ marginTop: '24px', padding: '20px', backgroundColor: 'var(--background)', borderRadius: 'var(--radius-md)' }}>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Direction</h3>
                                <p style={{ color: 'var(--text-secondary)' }}>
                                    👤 <strong>Président·e :</strong> {association.president}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'events' && (
                    <EventsTab associationId={associationId!} isOwner={isOwner} />
                )}

                {activeTab === 'news' && (
                    <NewsTab associationId={associationId!} isOwner={isOwner} />
                )}

                {activeTab === 'projects' && (
                    <ProjectsTab associationId={associationId!} isOwner={isOwner} />
                )}

                {activeTab === 'contact' && (
                    <div>
                        <h2 style={{ marginBottom: '20px' }}>Coordonnées</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {association.email && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <Mail size={24} style={{ color: 'var(--primary)' }} />
                                    <div>
                                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>Email</div>
                                        <a href={`mailto:${association.email}`} style={{ color: 'var(--primary)' }}>
                                            {association.email}
                                        </a>
                                    </div>
                                </div>
                            )}
                            {association.phone && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ fontSize: '24px' }}>📞</div>
                                    <div>
                                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>Téléphone</div>
                                        <a href={`tel:${association.phone}`} style={{ color: 'var(--primary)' }}>
                                            {association.phone}
                                        </a>
                                    </div>
                                </div>
                            )}
                            {association.website && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <Globe size={24} style={{ color: 'var(--primary)' }} />
                                    <div>
                                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>Site web</div>
                                        <a href={association.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>
                                            {association.website}
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
