'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { MultiImageUpload, PhotoCarousel, ListingModal } from '@/components/LazyComponents';

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

        try {
            const url = editingListing ? `/api/listings/${editingListing.id}` : '/api/listings';
            const method = editingListing ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setFormData({ title: '', description: '', price: '', category: 'SELL', photos: [] });
                setShowForm(false);
                setEditingListing(null);
                fetchListings();
            }
        } catch (error) {
            console.error('Error submitting listing:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) return;

        try {
            const response = await fetch(`/api/listings/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                fetchListings();
            } else {
                const errorText = await response.text();
                alert(`Erreur: ${errorText}`);
            }
        } catch (error) {
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
                        setFormData({ title: '', description: '', price: '', category: 'SELL', photos: [] });
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
                                <PhotoCarousel photos={listing.photos} title={listing.title} />

                                <div style={{ padding: '16px' }}>
                                    {/* Category and Price */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                        <span style={{
                                            fontWeight: '600',
                                            color: 'white',
                                            backgroundColor: 'var(--primary)',
                                            padding: '4px 12px',
                                            borderRadius: '16px',
                                            fontSize: '0.85rem',
                                        }}>
                                            {categoryLabels[listing.category] || listing.category}
                                        </span>
                                        {listing.price && (
                                            <span style={{
                                                fontWeight: '700',
                                                color: 'var(--accent)',
                                                fontSize: '1.5rem',
                                            }}>
                                                {listing.price}€
                                            </span>
                                        )}
                                    </div>

                                    {/* Title */}
                                    <h3 style={{
                                        marginBottom: '8px',
                                        fontSize: '1.25rem',
                                        fontWeight: '700',
                                        lineHeight: '1.3',
                                    }}>{listing.title}</h3>

                                    {/* Description */}
                                    <p style={{
                                        marginBottom: '12px',
                                        color: 'var(--text-secondary)',
                                        fontSize: '0.95rem',
                                        lineHeight: '1.5',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                    }}>{listing.description}</p>

                                    {/* Footer */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginTop: '12px',
                                        paddingTop: '12px',
                                        borderTop: '1px solid var(--border)'
                                    }}>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                            <div style={{ fontWeight: '500' }}>Par {listing.user.name}</div>
                                            <div>{getTimeAgo(listing.createdAt)}</div>
                                        </div>
                                        {session?.user?.id === listing.userId && (
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEdit(listing);
                                                    }}
                                                    style={{
                                                        padding: '8px',
                                                        backgroundColor: 'transparent',
                                                        border: 'none',
                                                        color: 'var(--primary)',
                                                        cursor: 'pointer',
                                                        fontSize: '1.2rem',
                                                    }}
                                                    title="Modifier"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(listing.id);
                                                    }}
                                                    style={{
                                                        padding: '8px',
                                                        backgroundColor: 'transparent',
                                                        border: 'none',
                                                        color: 'var(--danger)',
                                                        cursor: 'pointer',
                                                        fontSize: '1.2rem',
                                                    }}
                                                    title="Supprimer"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {selectedListing && (
                <ListingModal
                    listing={selectedListing}
                    isOpen={!!selectedListing}
                    onClose={() => setSelectedListing(null)}
                    onEdit={() => handleEdit(selectedListing)}
                    onDelete={() => handleDelete(selectedListing.id)}
                    isOwner={session?.user?.id === selectedListing.userId}
                />
            )}
        </div>
    );
}
