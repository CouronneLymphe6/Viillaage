'use client';

import { useState, useEffect } from 'react';
import { Plus, X, Edit2, Trash2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Business {
    id: string;
    name: string;
    description: string;
    category: string;
    type?: string;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
    website?: string | null;
    photos: string;
    ownerId: string;
    owner: {
        name: string | null;
    };
}

export default function VillagePage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
    const [activeTab, setActiveTab] = useState<'MERCHANT' | 'ARTISAN'>('MERCHANT');
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
        type: 'MERCHANT',
        address: '',
        phone: '',
        email: '',
        website: '',
        photoUrl: '',
    });

    useEffect(() => {
        fetchBusinesses();
    }, []);

    const fetchBusinesses = async () => {
        try {
            const response = await fetch('/api/businesses');
            if (response.ok) {
                const data = await response.json();
                setBusinesses(data);
            }
        } catch (error) {
            console.error('Error fetching businesses:', error);
        }
    };

    const createBusiness = async (e: React.FormEvent) => {
        e.preventDefault();

        // OPTIMISTIC UI: Add immediately with temp ID
        const tempBusiness: Business = {
            id: 'temp-' + Date.now(),
            ...formData,
            photos: formData.photoUrl ? JSON.stringify([formData.photoUrl]) : "[]",
            ownerId: session?.user?.id || '',
            owner: { name: session?.user?.name || null },
        };
        setBusinesses([...businesses, tempBusiness]);
        setFormData({ name: '', description: '', category: '', type: 'MERCHANT', address: '', phone: '', email: '', website: '', photoUrl: '' });
        setShowForm(false);

        try {
            const photos = formData.photoUrl ? JSON.stringify([formData.photoUrl]) : "[]";
            const response = await fetch('/api/businesses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, photos }),
            });

            if (response.ok) {
                // Replace temp with real data
                const realBusiness = await response.json();
                setBusinesses(prev => prev.map(b => b.id === tempBusiness.id ? realBusiness : b));
            } else {
                // Rollback on error
                setBusinesses(prev => prev.filter(b => b.id !== tempBusiness.id));
                alert('Erreur lors de la création');
            }
        } catch (error) {
            // Rollback on error
            setBusinesses(prev => prev.filter(b => b.id !== tempBusiness.id));
            console.error('Error creating business:', error);
            alert('Erreur lors de la création');
        }
    };

    const updateBusiness = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingBusiness) return;

        // OPTIMISTIC UI: Update immediately - preserve all business properties
        const previousBusinesses = [...businesses];
        const photos = formData.photoUrl ? JSON.stringify([formData.photoUrl]) : "[]";

        setBusinesses(businesses.map(b =>
            b.id === editingBusiness.id
                ? {
                    ...b, // Keep all existing properties (id, ownerId, owner, etc.)
                    name: formData.name,
                    description: formData.description,
                    category: formData.category,
                    type: formData.type,
                    address: formData.address || null,
                    phone: formData.phone || null,
                    email: formData.email || null,
                    website: formData.website || null,
                    photos,
                }
                : b
        ));

        setFormData({ name: '', description: '', category: '', type: 'MERCHANT', address: '', phone: '', email: '', website: '', photoUrl: '' });
        setEditingBusiness(null);
        setShowForm(false);

        try {
            const response = await fetch(`/api/businesses/${editingBusiness.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, photos }),
            });

            if (!response.ok) {
                // Rollback on error
                setBusinesses(previousBusinesses);
                alert('Erreur lors de la modification');
            }
        } catch (error) {
            // Rollback on error
            setBusinesses(previousBusinesses);
            console.error('Error updating business:', error);
            alert('Erreur lors de la modification');
        }
    };

    const deleteBusiness = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce commerce ?')) return;

        // OPTIMISTIC UI: Remove immediately
        const previousBusinesses = [...businesses];
        setBusinesses(businesses.filter(b => b.id !== id));

        try {
            const response = await fetch(`/api/businesses/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok && response.status !== 204) {
                // Rollback on error
                setBusinesses(previousBusinesses);
                alert('Erreur lors de la suppression');
            }
        } catch (error) {
            // Rollback on error
            setBusinesses(previousBusinesses);
            console.error('Error deleting business:', error);
            alert('Erreur lors de la suppression');
        }
    };

    const openEditForm = (business: Business) => {
        const photosArray = JSON.parse(business.photos || "[]");
        setEditingBusiness(business);
        setFormData({
            name: business.name,
            description: business.description,
            category: business.category,
            type: business.type || 'MERCHANT',
            address: business.address || '',
            phone: business.phone || '',
            email: business.email || '',
            website: business.website || '',
            photoUrl: photosArray[0] || '',
        });
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingBusiness(null);
        setFormData({ name: '', description: '', category: '', type: 'MERCHANT', address: '', phone: '', email: '', website: '', photoUrl: '' });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Veuillez sélectionner une image valide');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('L\'image est trop grande. Maximum 5MB.');
            return;
        }

        setUploading(true);
        try {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setFormData({ ...formData, photoUrl: base64String });
                setUploading(false);
            };
            reader.onerror = () => {
                alert('Erreur lors de la lecture de l\'image');
                setUploading(false);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Erreur lors du téléchargement de l\'image');
            setUploading(false);
        }
    };

    const filteredBusinesses = businesses.filter(b => (b.type || 'MERCHANT') === activeTab);

    return (
        <div style={{ position: 'relative', minHeight: 'calc(100vh - 64px)' }}>
            <header style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', marginBottom: 'var(--spacing-xs)' }}>Les Pros</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>Commerces et artisans locaux</p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--border)' }}>
                    <button
                        onClick={() => setActiveTab('MERCHANT')}
                        style={{
                            padding: '12px 24px',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === 'MERCHANT' ? '2px solid var(--primary)' : '2px solid transparent',
                            color: activeTab === 'MERCHANT' ? 'var(--primary)' : 'var(--text-secondary)',
                            fontWeight: '600',
                            fontSize: '1rem',
                            cursor: 'pointer',
                        }}
                    >
                        Commerçants
                    </button>
                    <button
                        onClick={() => setActiveTab('ARTISAN')}
                        style={{
                            padding: '12px 24px',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === 'ARTISAN' ? '2px solid var(--primary)' : '2px solid transparent',
                            color: activeTab === 'ARTISAN' ? 'var(--primary)' : 'var(--text-secondary)',
                            fontWeight: '600',
                            fontSize: '1rem',
                            cursor: 'pointer',
                        }}
                    >
                        Artisans Recommandés
                    </button>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 'var(--spacing-md)' }} className="businesses-grid">
                {filteredBusinesses.map((business) => {
                    const photosArray = JSON.parse(business.photos || "[]");
                    const photoUrl = photosArray[0];
                    const isOwner = session?.user?.id === business.ownerId;

                    return (
                        <div
                            key={business.id}
                            onClick={() => router.push(`/village/pro/${business.id}`)}
                            style={{
                                backgroundColor: 'var(--secondary)',
                                borderRadius: 'var(--radius-md)',
                                boxShadow: 'var(--shadow-sm)',
                                position: 'relative',
                                overflow: 'hidden',
                                cursor: 'pointer',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                            }}
                        >
                            {photoUrl && (
                                <div style={{
                                    width: '100%',
                                    height: '200px',
                                    backgroundImage: `url(${photoUrl})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                }} />
                            )}

                            {isOwner && (
                                <div style={{
                                    position: 'absolute',
                                    top: '12px',
                                    right: '12px',
                                    display: 'flex',
                                    gap: '8px',
                                    zIndex: 10,
                                }}>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openEditForm(business);
                                        }}
                                        style={{
                                            backgroundColor: 'var(--primary)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '36px',
                                            height: '36px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                                        }}
                                        title="Modifier"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteBusiness(business.id);
                                        }}
                                        style={{
                                            backgroundColor: '#e74c3c',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '36px',
                                            height: '36px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                                        }}
                                        title="Supprimer"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            )}

                            <div style={{ padding: 'var(--spacing-md)' }}>
                                {business.type === 'ARTISAN' && (
                                    <div style={{
                                        display: 'inline-block',
                                        fontSize: '0.75rem',
                                        color: 'var(--text-secondary)',
                                        backgroundColor: 'rgba(0,0,0,0.05)',
                                        padding: '4px 8px',
                                        borderRadius: '12px',
                                        marginBottom: '8px',
                                    }}>
                                        Recommandé par {business.owner.name}
                                    </div>
                                )}

                                <div style={{ marginBottom: 'var(--spacing-xs)' }}>
                                    <span style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: '600' }}>{business.category}</span>
                                </div>
                                <h3 style={{ marginBottom: 'var(--spacing-xs)' }}>{business.name}</h3>
                                <p style={{ marginBottom: 'var(--spacing-sm)', color: 'var(--text-secondary)' }}>{business.description}</p>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    {business.address && <div>📍 {business.address}</div>}
                                    {business.phone && <div>📞 {business.phone}</div>}
                                    {business.email && <div>✉️ {business.email}</div>}
                                    {business.website && <div>🌐 <a href={business.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>{business.website}</a></div>}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <style jsx>{`
                @media (max-width: 768px) {
                    .businesses-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>

            <button
                onClick={() => setShowForm(true)}
                style={{
                    position: 'fixed',
                    bottom: '24px',
                    right: '24px',
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 1000,
                }}
            >
                <Plus size={28} />
            </button>

            {showForm && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    zIndex: 2000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px',
                }}>
                    <div style={{
                        backgroundColor: 'var(--background)',
                        padding: '24px',
                        borderRadius: 'var(--radius-md)',
                        width: '100%',
                        maxWidth: '600px',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        position: 'relative',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                    }}>
                        <button
                            onClick={closeForm}
                            style={{
                                position: 'absolute',
                                top: '16px',
                                right: '16px',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--text-secondary)',
                                zIndex: 1,
                            }}
                        >
                            <X size={24} />
                        </button>

                        <h3 style={{ marginBottom: '20px', fontSize: '1.5rem', paddingRight: '30px' }}>
                            {editingBusiness ? 'Modifier le commerce' : 'Ajouter un commerce'}
                        </h3>

                        <form onSubmit={editingBusiness ? updateBusiness : createBusiness}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Type d'ajout</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <input
                                            type="radio"
                                            name="type"
                                            value="MERCHANT"
                                            checked={formData.type === 'MERCHANT'}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        />
                                        Je suis commerçant
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <input
                                            type="radio"
                                            name="type"
                                            value="ARTISAN"
                                            checked={formData.type === 'ARTISAN'}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        />
                                        Je recommande un artisan
                                    </label>
                                </div>
                            </div>

                            <input
                                type="text"
                                placeholder="Nom du commerce"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '1rem', marginBottom: '12px', boxSizing: 'border-box' }}
                            />
                            <input
                                type="text"
                                placeholder="Catégorie (ex: Boulangerie)"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                required
                                style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '1rem', marginBottom: '12px', boxSizing: 'border-box' }}
                            />
                            <textarea
                                placeholder="Description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                                rows={3}
                                style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '1rem', fontFamily: 'inherit', marginBottom: '12px', boxSizing: 'border-box' }}
                            />

                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem' }}>
                                    📸 Photo du commerce (optionnel)
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    disabled={uploading}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: 'var(--radius-sm)',
                                        border: '1px solid var(--border)',
                                        fontSize: '1rem',
                                        boxSizing: 'border-box',
                                        cursor: uploading ? 'wait' : 'pointer'
                                    }}
                                />
                                {uploading && (
                                    <div style={{ marginTop: '8px', color: 'var(--primary)', fontSize: '0.9rem' }}>
                                        Téléchargement en cours...
                                    </div>
                                )}
                                {formData.photoUrl && !uploading && (
                                    <div style={{ marginTop: '8px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', maxHeight: '150px', position: 'relative' }}>
                                        <img src={formData.photoUrl} alt="Aperçu" style={{ width: '100%', height: 'auto', objectFit: 'cover' }} />
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, photoUrl: '' })}
                                            style={{
                                                position: 'absolute',
                                                top: '8px',
                                                right: '8px',
                                                backgroundColor: '#e74c3c',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '50%',
                                                width: '28px',
                                                height: '28px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                            }}
                                            title="Supprimer l'image"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <input
                                type="text"
                                placeholder="Adresse"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '1rem', marginBottom: '12px', boxSizing: 'border-box' }}
                            />
                            <input
                                type="tel"
                                placeholder="Téléphone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '1rem', marginBottom: '12px', boxSizing: 'border-box' }}
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '1rem', marginBottom: '12px', boxSizing: 'border-box' }}
                            />
                            <input
                                type="url"
                                placeholder="Site web"
                                value={formData.website}
                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '1rem', marginBottom: '16px', boxSizing: 'border-box' }}
                            />
                            <button
                                type="submit"
                                disabled={uploading}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    backgroundColor: uploading ? '#ccc' : 'var(--primary)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 'var(--radius-sm)',
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    cursor: uploading ? 'wait' : 'pointer',
                                    boxSizing: 'border-box'
                                }}
                            >
                                {editingBusiness ? 'Enregistrer les modifications' : (formData.type === 'MERCHANT' ? 'Ajouter mon commerce' : 'Recommander cet artisan')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
