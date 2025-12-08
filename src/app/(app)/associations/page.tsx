'use client';

import { useState, useEffect } from 'react';
import { Plus, X, Edit2, Trash2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Association {
    id: string;
    name: string;
    description: string;
    category: string;
    president?: string | null;
    email?: string | null;
    phone?: string | null;
    website?: string | null;
    photoUrl?: string | null;
    ownerId: string;
    owner: {
        name: string | null;
    };
}

export default function AssociationsPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [associations, setAssociations] = useState<Association[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingAssociation, setEditingAssociation] = useState<Association | null>(null);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
        president: '',
        email: '',
        phone: '',
        website: '',
        photoUrl: '',
    });

    useEffect(() => {
        fetchAssociations();
    }, []);

    const fetchAssociations = async () => {
        try {
            const response = await fetch('/api/associations');
            if (response.ok) {
                const data = await response.json();
                setAssociations(data);
            }
        } catch (error) {
            console.error('Error fetching associations:', error);
        }
    };

    const createAssociation = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/associations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setFormData({ name: '', description: '', category: '', president: '', email: '', phone: '', website: '', photoUrl: '' });
                setShowForm(false);
                fetchAssociations();
            }
        } catch (error) {
            console.error('Error creating association:', error);
        }
    };

    const updateAssociation = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingAssociation) return;

        try {
            const response = await fetch(`/api/associations/${editingAssociation.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setFormData({ name: '', description: '', category: '', president: '', email: '', phone: '', website: '', photoUrl: '' });
                setEditingAssociation(null);
                setShowForm(false);
                fetchAssociations();
            }
        } catch (error) {
            console.error('Error updating association:', error);
        }
    };

    const deleteAssociation = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette association ?')) return;

        try {
            const response = await fetch(`/api/associations/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                fetchAssociations();
            }
        } catch (error) {
            console.error('Error deleting association:', error);
        }
    };

    const openEditForm = (association: Association) => {
        setEditingAssociation(association);
        setFormData({
            name: association.name,
            description: association.description,
            category: association.category,
            president: association.president || '',
            email: association.email || '',
            phone: association.phone || '',
            website: association.website || '',
            photoUrl: association.photoUrl || '',
        });
        setShowForm(true);
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
        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData({ ...formData, photoUrl: reader.result as string });
            setUploading(false);
        };
        reader.onerror = () => {
            alert('Erreur lors de la lecture de l\'image');
            setUploading(false);
        };
        reader.readAsDataURL(file);
    };

    return (
        <div style={{ position: 'relative', minHeight: 'calc(100vh - 64px)' }}>
            <header style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', marginBottom: 'var(--spacing-xs)' }}>Les Assos</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>Associations locales de notre village</p>
                    </div>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 'var(--spacing-md)' }} className="associations-grid">
                {associations.map((association) => {
                    const isOwner = session?.user?.id === association.ownerId;

                    return (
                        <div
                            key={association.id}
                            onClick={() => router.push(`/associations/${association.id}`)}
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
                            {association.photoUrl && (
                                <div style={{
                                    width: '100%',
                                    height: '200px',
                                    backgroundImage: `url(${association.photoUrl})`,
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
                                            openEditForm(association);
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
                                            deleteAssociation(association.id);
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
                                <div style={{ marginBottom: 'var(--spacing-xs)' }}>
                                    <span style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: '600' }}>{association.category}</span>
                                </div>
                                <h3 style={{ marginBottom: 'var(--spacing-xs)' }}>{association.name}</h3>
                                <p style={{ marginBottom: 'var(--spacing-sm)', color: 'var(--text-secondary)' }}>
                                    {association.description.length > 100
                                        ? `${association.description.substring(0, 100)}...`
                                        : association.description}
                                </p>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    {association.president && <div>👤 Président·e : {association.president}</div>}
                                    {association.phone && <div>📞 {association.phone}</div>}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <style jsx>{`
                @media (max-width: 768px) {
                    .associations-grid {
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
                            onClick={() => {
                                setShowForm(false);
                                setEditingAssociation(null);
                                setFormData({ name: '', description: '', category: '', president: '', email: '', phone: '', website: '', photoUrl: '' });
                            }}
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
                            {editingAssociation ? 'Modifier l\'association' : 'Ajouter une association'}
                        </h3>

                        <form onSubmit={editingAssociation ? updateAssociation : createAssociation}>
                            <input
                                type="text"
                                placeholder="Nom de l'association"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '1rem', marginBottom: '12px', boxSizing: 'border-box' }}
                            />
                            <input
                                type="text"
                                placeholder="Catégorie (ex: Sport, Culture, etc.)"
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
                            <input
                                type="text"
                                placeholder="Président·e"
                                value={formData.president}
                                onChange={(e) => setFormData({ ...formData, president: e.target.value })}
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
                                style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '1rem', marginBottom: '12px', boxSizing: 'border-box' }}
                            />

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Photo de l'association</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    disabled={uploading}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '2px solid var(--border)',
                                        borderRadius: 'var(--radius-md)',
                                    }}
                                />
                                {uploading && <p style={{ marginTop: '8px', color: 'var(--primary)' }}>Chargement...</p>}
                                {formData.photoUrl && (
                                    <div style={{ marginTop: '12px' }}>
                                        <img src={formData.photoUrl} alt="Preview" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={uploading}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    backgroundColor: 'var(--primary)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 'var(--radius-sm)',
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    cursor: uploading ? 'not-allowed' : 'pointer',
                                    boxSizing: 'border-box',
                                    opacity: uploading ? 0.5 : 1,
                                }}
                            >
                                {editingAssociation ? 'Modifier' : 'Ajouter'} l'association
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
