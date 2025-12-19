'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { MultiImageUpload, PhotoCarousel, ListingModal } from '@/components/LazyComponents';
import { MapPin, User, Clock, Tag, Edit2, Trash2 } from 'lucide-react';

interface Listing {
    id: string;
    title: string;
    description: string;
    price?: number | null;
    category: string;
    photos: string[];
    contactPhone?: string | null;
    contactEmail?: string | null;
    createdAt: string;
    userId: string;
    user: {
        name: string | null;
    };
}

export default function MarketPage() {
    const { data: session } = useSession();
    const [listings, setListings] = useState<Listing[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        category: 'SELL',
        photos: [] as string[],
        contactPhone: '',
        contactEmail: '',
    });

    const [editingListing, setEditingListing] = useState<Listing | null>(null);
    const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

    // Search and filter states
    const [searchText, setSearchText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

    useEffect(() => {
        fetchListings();
    }, []);

    const fetchListings = async () => {
        try {
            const response = await fetch('/api/listings');
            if (response.ok) {
                const data = await response.json();
                setListings(data);
            }
        } catch (error) {
            console.error('Error fetching listings:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // OPTIMISTIC UI: Add/Update immediately
        const previousListings = [...listings];

        if (editingListing) {
            // Update existing
            setListings(listings.map(l =>
                l.id === editingListing.id
                    ? {
                        ...l,
                        ...formData,
                        price: formData.price ? parseFloat(formData.price) : null,
                        photos: formData.photos || [],
                    }
                    : l
            ));
        } else {
            // Create new with temp ID
            const tempListing: Listing = {
                id: 'temp-' + Date.now(),
                title: formData.title,
                description: formData.description,
                price: formData.price ? parseFloat(formData.price) : null,
                category: formData.category,
                photos: formData.photos || [],
                createdAt: new Date().toISOString(),
                userId: session?.user?.id || '',
                user: {
                    name: session?.user?.name || null,
                },
            };
            setListings([tempListing, ...listings]);
        }

        setFormData({ title: '', description: '', price: '', category: 'SELL', photos: [], contactPhone: '', contactEmail: '' });
        setShowForm(false);
        setEditingListing(null);

        try {
            const url = editingListing ? `/api/listings/${editingListing.id}` : '/api/listings';
            const method = editingListing ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                if (!editingListing) {
                    // Replace temp with real data
                    const realListing = await response.json();
                    setListings(prev => prev.map(l =>
                        l.id.startsWith('temp-') ? realListing : l
                    ));
                }
            } else {
                // Rollback on error
                setListings(previousListings);
                alert('Erreur lors de l\'enregistrement');
            }
        } catch (error) {
            // Rollback on error
            setListings(previousListings);
            console.error('Error submitting listing:', error);
            alert('Erreur lors de l\'enregistrement');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) return;

        // OPTIMISTIC UI: Remove immediately
        const previousListings = [...listings];
        setListings(listings.filter(listing => listing.id !== id));

        try {
            const response = await fetch(`/api/listings/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                // Rollback on error
                setListings(previousListings);
                const errorText = await response.text();
                alert(`Erreur: ${errorText}`);
            }
        } catch (error) {
            // Rollback on error
            setListings(previousListings);
            console.error('Error deleting listing:', error);
        }
    };

    const handleEdit = (listing: Listing) => {
        setEditingListing(listing);
        setFormData({
            title: listing.title,
            description: listing.description,
            price: listing.price?.toString() || '',
            category: listing.category,
            photos: listing.photos || [],
            contactPhone: listing.contactPhone || '',
            contactEmail: listing.contactEmail || '',
        });
        setShowForm(true);
    };

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

    // Filter listings based on search text and category
    const filteredListings = listings.filter((listing) => {
        // Category filter
        if (selectedCategory !== 'ALL' && listing.category !== selectedCategory) {
            return false;
        }

        // Text search filter
        if (searchText.trim()) {
            const search = searchText.toLowerCase();
            return (
                listing.title.toLowerCase().includes(search) ||
                listing.description.toLowerCase().includes(search)
            );
        }

        return true;
    });

    return (
        <div>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: 'var(--spacing-xs)' }}>Le Marché</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Petites annonces entre voisins</p>
                </div>
                <button
                    onClick={() => {
                        setEditingListing(null);
                        setFormData({ title: '', description: '', price: '', category: 'SELL', photos: [], contactPhone: '', contactEmail: '' });
                        setShowForm(!showForm);
                    }}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                    }}
                >
                    {showForm ? 'Annuler' : '+ Nouvelle annonce'}
                </button>
            </header>

            {/* Search and Filters */}
            <div style={{
                backgroundColor: 'var(--secondary)',
                padding: 'var(--spacing-md)',
                borderRadius: 'var(--radius-md)',
                marginBottom: 'var(--spacing-lg)',
                boxShadow: 'var(--shadow-sm)',
            }}>
                {/* Search bar */}
                <div style={{ marginBottom: 'var(--spacing-md)' }}>
                    <input
                        type="text"
                        placeholder="🔍 Rechercher une annonce..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px 16px',
                            fontSize: '1rem',
                            borderRadius: 'var(--radius-sm)',
                            border: '2px solid var(--border)',
                            outline: 'none',
                            transition: 'border-color 0.2s',
                            boxSizing: 'border-box',
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                    />
                </div>

                {/* Category filters */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontWeight: '600', marginRight: '8px', fontSize: '0.9rem' }}>Catégories :</span>
                    <button
                        onClick={() => setSelectedCategory('ALL')}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '20px',
                            border: selectedCategory === 'ALL' ? '2px solid var(--primary)' : '2px solid var(--border)',
                            backgroundColor: selectedCategory === 'ALL' ? 'var(--primary)' : 'transparent',
                            color: selectedCategory === 'ALL' ? 'white' : 'var(--text)',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '0.9rem',
                            transition: 'all 0.2s',
                        }}
                    >
                        🏷️ Tout
                    </button>
                    <button
                        onClick={() => setSelectedCategory('SELL')}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '20px',
                            border: selectedCategory === 'SELL' ? '2px solid var(--primary)' : '2px solid var(--border)',
                            backgroundColor: selectedCategory === 'SELL' ? 'var(--primary)' : 'transparent',
                            color: selectedCategory === 'SELL' ? 'white' : 'var(--text)',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '0.9rem',
                            transition: 'all 0.2s',
                        }}
                    >
                        💰 Vente
                    </button>
                    <button
                        onClick={() => setSelectedCategory('GIVE')}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '20px',
                            border: selectedCategory === 'GIVE' ? '2px solid var(--primary)' : '2px solid var(--border)',
                            backgroundColor: selectedCategory === 'GIVE' ? 'var(--primary)' : 'transparent',
                            color: selectedCategory === 'GIVE' ? 'white' : 'var(--text)',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '0.9rem',
                            transition: 'all 0.2s',
                        }}
                    >
                        🎁 Don
                    </button>
                    <button
                        onClick={() => setSelectedCategory('EXCHANGE')}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '20px',
                            border: selectedCategory === 'EXCHANGE' ? '2px solid var(--primary)' : '2px solid var(--border)',
                            backgroundColor: selectedCategory === 'EXCHANGE' ? 'var(--primary)' : 'transparent',
                            color: selectedCategory === 'EXCHANGE' ? 'white' : 'var(--text)',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '0.9rem',
                            transition: 'all 0.2s',
                        }}
                    >
                        🔄 Échange
                    </button>
                    <button
                        onClick={() => setSelectedCategory('LEND')}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '20px',
                            border: selectedCategory === 'LEND' ? '2px solid var(--primary)' : '2px solid var(--border)',
                            backgroundColor: selectedCategory === 'LEND' ? 'var(--primary)' : 'transparent',
                            color: selectedCategory === 'LEND' ? 'white' : 'var(--text)',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '0.9rem',
                            transition: 'all 0.2s',
                        }}
                    >
                        🤝 Prêt
                    </button>
                </div>

                {/* Results counter */}
                <div style={{ marginTop: 'var(--spacing-sm)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {filteredListings.length} annonce{filteredListings.length > 1 ? 's' : ''} trouvée{filteredListings.length > 1 ? 's' : ''}
                </div>
            </div>

            {showForm && (
                <div style={{
                    backgroundColor: 'var(--secondary)',
                    padding: 'var(--spacing-lg)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: 'var(--spacing-lg)',
                    boxShadow: 'var(--shadow-md)',
                }}>
                    <h3 style={{ marginBottom: 'var(--spacing-md)' }}>{editingListing ? 'Modifier l\'annonce' : 'Créer une annonce'}</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            required
                            style={{
                                padding: '10px',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border)',
                                fontSize: '1rem',
                            }}
                        >
                            <option value="SELL">💰 Vente</option>
                            <option value="GIVE">🎁 Don</option>
                            <option value="EXCHANGE">🔄 Échange</option>
                            <option value="LEND">🤝 Prêt</option>
                        </select>
                        <input
                            type="text"
                            placeholder="Titre de l'annonce"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                            style={{
                                padding: '10px',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border)',
                                fontSize: '1rem',
                            }}
                        />
                        <textarea
                            placeholder="Description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                            rows={4}
                            style={{
                                padding: '10px',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border)',
                                fontSize: '1rem',
                                fontFamily: 'inherit',
                                resize: 'vertical',
                            }}
                        />
                        {formData.category === 'SELL' && (
                            <input
                                type="number"
                                placeholder="Prix (€)"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                step="0.01"
                                min="0"
                                style={{
                                    padding: '10px',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid var(--border)',
                                    fontSize: '1rem',
                                }}
                            />
                        )}

                        {/* Contact Information */}
                        <div style={{
                            backgroundColor: 'rgba(0, 191, 165, 0.05)',
                            padding: '16px',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid rgba(0, 191, 165, 0.2)'
                        }}>
                            <h4 style={{
                                marginBottom: '12px',
                                fontSize: '0.95rem',
                                color: 'var(--primary)',
                                fontWeight: '600'
                            }}>
                                📞 Informations de contact (au moins 1 requis)
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <input
                                    type="tel"
                                    placeholder="Téléphone (ex: 06 12 34 56 78)"
                                    value={formData.contactPhone}
                                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                                    style={{
                                        padding: '10px',
                                        borderRadius: 'var(--radius-sm)',
                                        border: '1px solid var(--border)',
                                        fontSize: '1rem',
                                    }}
                                />
                                <input
                                    type="email"
                                    placeholder="Email (ex: contact@exemple.fr)"
                                    value={formData.contactEmail}
                                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                                    style={{
                                        padding: '10px',
                                        borderRadius: 'var(--radius-sm)',
                                        border: '1px solid var(--border)',
                                        fontSize: '1rem',
                                    }}
                                />
                                <p style={{
                                    fontSize: '0.8rem',
                                    color: 'var(--text-secondary)',
                                    margin: 0,
                                    fontStyle: 'italic'
                                }}>
                                    💡 Les acheteurs pourront vous contacter via ces coordonnées
                                </p>
                            </div>
                        </div>
                        <MultiImageUpload
                            onUpload={(urls) => setFormData({ ...formData, photos: urls })}
                            currentImages={formData.photos}
                            maxImages={3}
                        />
                        <button
                            type="submit"
                            style={{
                                padding: '12px',
                                backgroundColor: 'var(--primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                            }}
                        >
                            {editingListing ? 'Enregistrer les modifications' : 'Publier l\'annonce'}
                        </button>
                    </form>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--spacing-md)' }}>
                {filteredListings.length === 0 ? (
                    <div style={{
                        gridColumn: '1 / -1',
                        textAlign: 'center',
                        padding: '60px 20px',
                        color: 'var(--text-secondary)',
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔍</div>
                        <h3 style={{ marginBottom: '8px' }}>Aucune annonce trouvée</h3>
                        <p>Essayez de modifier vos critères de recherche</p>
                    </div>
                ) : (
                    filteredListings.map((listing) => {
                        const isNew = new Date().getTime() - new Date(listing.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000; // 7 days

                        return (
                            <div
                                key={listing.id}
                                className="listing-card"
                                onClick={() => {
                                    console.log('Card clicked:', listing.id);
                                    setSelectedListing(listing);
                                }}
                                style={{
                                    backgroundColor: 'var(--secondary)',
                                    borderRadius: '12px',
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                                    overflow: 'hidden',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer',
                                    position: 'relative',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.15)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                                }}
                            >
                                {/* New badge */}
                                {isNew && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '12px',
                                        left: '12px',
                                        backgroundColor: '#10b981',
                                        color: 'white',
                                        padding: '4px 12px',
                                        borderRadius: '12px',
                                        fontSize: '0.75rem',
                                        fontWeight: '600',
                                        zIndex: 10,
                                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                                    }}>
                                        NOUVEAU
                                    </div>
                                )}

                                {/* Photo carousel */}
                                <PhotoCarousel photos={listing.photos || []} title={listing.title} />

                                <div style={{
                                    padding: '20px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    flex: 1,
                                    background: 'linear-gradient(180deg, var(--secondary) 0%, rgba(255,255,255,0.5) 100%)'
                                }}>
                                    {/* Header: Category & Price */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '6px 12px',
                                            backgroundColor: 'rgba(0, 191, 165, 0.1)',
                                            color: 'var(--primary)',
                                            borderRadius: '20px',
                                            fontSize: '0.8rem',
                                            fontWeight: '600',
                                            border: '1px solid rgba(0, 191, 165, 0.2)',
                                        }}>
                                            <Tag size={14} />
                                            {categoryLabels[listing.category] || listing.category}
                                        </div>

                                        {listing.price !== null && (
                                            <div style={{
                                                fontSize: '1.4rem',
                                                fontWeight: '800',
                                                color: 'var(--text-main)',
                                                fontFamily: 'Poppins, sans-serif',
                                                background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                                                WebkitBackgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent',
                                                textShadow: '0 2px 10px rgba(0, 191, 165, 0.2)'
                                            }}>
                                                {listing.price === 0 ? 'Gratuit' : `${listing.price}€`}
                                            </div>
                                        )}
                                    </div>

                                    {/* Title */}
                                    <h3 style={{
                                        marginBottom: '10px',
                                        fontSize: '1.2rem',
                                        fontWeight: '700',
                                        color: 'var(--text-main)',
                                        lineHeight: '1.4',
                                        fontFamily: 'Poppins, sans-serif',
                                    }}>{listing.title}</h3>

                                    {/* Description (Truncated) */}
                                    <p style={{
                                        marginBottom: '16px',
                                        color: 'var(--text-secondary)',
                                        fontSize: '0.95rem',
                                        lineHeight: '1.6',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        flex: 1,
                                    }}>
                                        {listing.description}
                                    </p>

                                    {/* Divider */}
                                    <div style={{
                                        height: '1px',
                                        backgroundColor: 'var(--border)',
                                        margin: '0 -20px 16px -20px',
                                        opacity: 0.5
                                    }} />

                                    {/* Footer: User & Date & Actions */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        fontSize: '0.85rem'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                                            <div style={{
                                                width: '28px',
                                                height: '28px',
                                                borderRadius: '50%',
                                                backgroundColor: 'var(--primary)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontSize: '0.8rem',
                                                flexShrink: 0,
                                            }}>
                                                {listing.user?.name ? listing.user.name[0].toUpperCase() : <User size={14} />}
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontWeight: '600', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {listing.user?.name || 'Voisin inconnu'}
                                                </span>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                    {getTimeAgo(listing.createdAt)}
                                                </span>
                                            </div>
                                        </div>


                                        {(session?.user?.id === listing.userId || session?.user?.role === 'ADMIN') && (
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEdit(listing);
                                                    }}
                                                    style={{
                                                        padding: '6px',
                                                        color: 'var(--primary)',
                                                        background: 'rgba(0, 191, 165, 0.1)',
                                                        borderRadius: '8px',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    className="action-btn"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(listing.id);
                                                    }}
                                                    style={{
                                                        padding: '6px',
                                                        color: '#ff6b6b',
                                                        background: 'rgba(255, 107, 107, 0.1)',
                                                        borderRadius: '8px',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    className="action-btn"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );

                    })
                )}
            </div >

            {selectedListing && (
                <ListingModal
                    listing={selectedListing}
                    isOpen={!!selectedListing}
                    onClose={() => setSelectedListing(null)}
                    onEdit={() => handleEdit(selectedListing)}
                    onDelete={() => handleDelete(selectedListing.id)}
                    isOwner={session?.user?.id === selectedListing.userId || session?.user?.role === 'ADMIN'}
                />
            )}
        </div >
    );
}
